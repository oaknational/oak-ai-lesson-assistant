import type { Aila } from "@oakai/aila/src/core/Aila";
import type { AilaServices } from "@oakai/aila/src/core/AilaServices";
import type { Message } from "@oakai/aila/src/core/chat";
import type {
  AilaOptions,
  AilaPublicChatOptions,
  AilaInitializationOptions,
} from "@oakai/aila/src/core/types";
import { AilaAmericanisms } from "@oakai/aila/src/features/americanisms/AilaAmericanisms";
import {
  DatadogAnalyticsAdapter,
  PosthogAnalyticsAdapter,
} from "@oakai/aila/src/features/analytics";
import { AilaRag } from "@oakai/aila/src/features/rag/AilaRag";
import { BasicThreatDetector } from "@oakai/aila/src/features/threatDetection/detectors/BasicThreatDetector";
import { HeliconeThreatDetector } from "@oakai/aila/src/features/threatDetection/detectors/HeliconeThreatDetector";
import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import type { TracingSpan } from "@oakai/core/src/tracing/serverTracing";
import { withTelemetry } from "@oakai/core/src/tracing/serverTracing";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { prisma as globalPrisma } from "@oakai/db/client";
import { aiLogger } from "@oakai/logger";
import type { NextRequest } from "next/server";
import invariant from "tiny-invariant";

import type { Config } from "./config";
import { handleChatException } from "./errorHandling";
import {
  getFixtureLLMService,
  getFixtureModerationOpenAiClient,
} from "./fixtures";
import { fetchAndCheckUser } from "./user";

const log = aiLogger("chat");

export const maxDuration = 300;

const prisma: PrismaClientWithAccelerate = globalPrisma;

export async function GET() {
  return Promise.resolve(new Response("Chat API is working", { status: 200 }));
}

async function setupChatHandler(req: NextRequest) {
  return await withTelemetry(
    "chat-setup-chat-handler",
    {},
    async (span: TracingSpan) => {
      const json = await req.json();
      const {
        id: chatId,
        messages,
        lessonPlan = {},
        options: chatOptions = {},
      }: {
        id: string;
        messages: Message[];
        lessonPlan?: LooseLessonPlan;
        options?: AilaPublicChatOptions;
      } = json;

      const options: AilaOptions = {
        useRag: chatOptions.useRag ?? true,
        temperature: chatOptions.temperature ?? 0.7,
        numberOfLessonPlansInRag: chatOptions.numberOfLessonPlansInRag ?? 5,
        usePersistence: true,
        useModeration: true,
      };

      const llmService = getFixtureLLMService(req.headers, chatId);
      const moderationAiClient = getFixtureModerationOpenAiClient(
        req.headers,
        chatId,
      );

      const threatDetectors = [
        new BasicThreatDetector(),
        new HeliconeThreatDetector(),
      ];

      span.setTag("chat_id", chatId);
      span.setTag("messages.count", messages.length);
      span.setTag("options", JSON.stringify(options));

      return {
        chatId,
        messages,
        lessonPlan,
        options,
        llmService,
        moderationAiClient,
        threatDetectors,
      };
    },
  );
}

function setTelemetryMetadata(
  span: TracingSpan,
  id: string,
  messages: Message[],
  lessonPlan: LooseLessonPlan,
  options: AilaOptions,
) {
  span.setTag("chat_id", id);
  span.setTag("messages.count", messages.length);
  span.setTag("has_lesson_plan", Object.keys(lessonPlan).length > 0);
  span.setTag("use_rag", options.useRag);
  span.setTag("temperature", options.temperature);
  span.setTag(
    "number_of_lesson_plans_in_rag",
    options.numberOfLessonPlansInRag,
  );
  span.setTag("use_persistence", options.usePersistence);
  span.setTag("use_moderation", options.useModeration);
}

function handleConnectionAborted(req: NextRequest) {
  const abortController = new AbortController();

  req.signal.addEventListener("abort", () => {
    log.info("Client has disconnected");
    abortController.abort();
  });
  return abortController;
}

async function generateChatStream(
  aila: Aila,
  abortController: AbortController,
): Promise<Response> {
  return await withTelemetry(
    "chat-aila-generate",
    { chat_id: aila.chatId, user_id: aila.userId },
    async () => {
      try {
        invariant(aila, "Aila instance is required");
        const result = await aila.generate({ abortController });
        const transformStream = new TransformStream({
          transform(chunk, controller) {
            const formattedChunk = new TextEncoder().encode(
              `0:${JSON.stringify(chunk)}\n`,
            );
            controller.enqueue(formattedChunk);
          },
        });

        const stream = result.pipeThrough(transformStream);
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      } catch (error) {
        log.error("Error generating chat stream", { error });
        return new Response(
          JSON.stringify({ error: "Stream generation failed" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    },
  );
}

export async function handleChatPostRequest(
  req: NextRequest,
  config: Config,
): Promise<Response> {
  return await withTelemetry("chat-api", {}, async (span: TracingSpan) => {
    const {
      chatId,
      messages,
      lessonPlan,
      options,
      llmService,
      moderationAiClient,
      threatDetectors,
    } = await setupChatHandler(req);

    setTelemetryMetadata(span, chatId, messages, lessonPlan, options);

    let userId: string | undefined;
    let aila: Aila | undefined;

    try {
      userId = await fetchAndCheckUser(chatId);

      span.setTag("user_id", userId);
      aila = await withTelemetry(
        "chat-create-aila",
        { chat_id: chatId, user_id: userId },
        async (): Promise<Aila> => {
          const ailaOptions: Partial<AilaInitializationOptions> = {
            options,
            chat: {
              id: chatId,
              userId,
              messages,
            },
            services: {
              chatLlmService: llmService,
              moderationAiClient,
              ragService: (aila: AilaServices) => new AilaRag({ aila }),
              americanismsService: () => new AilaAmericanisms(),
              analyticsAdapters: (aila: AilaServices) => [
                new PosthogAnalyticsAdapter(aila),
                new DatadogAnalyticsAdapter(aila),
              ],
              threatDetectors: () => threatDetectors,
            },

            lessonPlan: lessonPlan ?? {},
          };
          const result = await config.createAila(ailaOptions);
          return result;
        },
      );
      invariant(aila, "Aila instance is required");

      const abortController = handleConnectionAborted(req);
      const stream = await generateChatStream(aila, abortController);
      return stream;
    } catch (e) {
      return handleChatException(span, e, chatId, prisma);
    } finally {
      if (aila) {
        await aila.ensureShutdown();
      }
    }
  });
}

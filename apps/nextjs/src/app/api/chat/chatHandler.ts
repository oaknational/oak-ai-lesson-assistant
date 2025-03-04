import type { Aila } from "@oakai/aila/src/core/Aila";
import type { AilaServices } from "@oakai/aila/src/core/AilaServices";
import type { Message } from "@oakai/aila/src/core/chat";
import { LessonPlanCategorisationPlugin } from "@oakai/aila/src/core/document/plugins/LessonPlanCategorisationPlugin";
import { LessonPlanPlugin } from "@oakai/aila/src/core/document/plugins/LessonPlanPlugin";
import { LessonPlanSchema } from "@oakai/aila/src/core/document/schemas/lessonPlan";
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
import { AilaCategorisation } from "@oakai/aila/src/features/categorisation/categorisers/AilaCategorisation";
import { AilaRag } from "@oakai/aila/src/features/rag/AilaRag";
import { HeliconeThreatDetector } from "@oakai/aila/src/features/threatDetection/detectors/helicone/HeliconeThreatDetector";
import { LakeraThreatDetector } from "@oakai/aila/src/features/threatDetection/detectors/lakera/LakeraThreatDetector";
import type { AilaCategorisationFeature } from "@oakai/aila/src/features/types";
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
        options: chatOptions = {},
      }: {
        id: string;
        messages: Message[];
        options?: AilaPublicChatOptions;
      } = json;

      const options: AilaOptions = {
        useRag: chatOptions.useRag ?? true,
        temperature: chatOptions.temperature ?? 0.7,
        numberOfRecordsInRag: chatOptions.numberOfRecordsInRag ?? 5,
        usePersistence: true,
        useModeration: true,
      };

      const llmService = getFixtureLLMService(req.headers, chatId);
      const moderationAiClient = getFixtureModerationOpenAiClient(
        req.headers,
        chatId,
      );

      const threatDetectors = [
        new HeliconeThreatDetector(),
        new LakeraThreatDetector(),
      ];

      span.setTag("chat_id", chatId);
      span.setTag("messages.count", messages.length);
      span.setTag("options", JSON.stringify(options));

      return {
        chatId,
        messages,
        options,
        llmService,
        moderationAiClient,
        threatDetectors,
      };
    },
  );
}

function setTelemetryMetadata({
  span,
  id,
  messages,
  lessonPlan,
  options,
}: {
  span: TracingSpan;
  id: string;
  messages: Message[];
  lessonPlan: LooseLessonPlan;
  options: AilaOptions;
}) {
  span.setTag("chat_id", id);
  span.setTag("messages.count", messages.length);
  span.setTag("has_lesson_plan", Object.keys(lessonPlan).length > 0);
  span.setTag("use_rag", options.useRag);
  span.setTag("temperature", options.temperature);
  span.setTag("number_of_records_in_rag", options.numberOfRecordsInRag);
  span.setTag("use_persistence", options.usePersistence);
  span.setTag("use_moderation", options.useModeration);
}

function handleConnectionAborted(req: NextRequest) {
  const abortController = new AbortController();

  req.signal.addEventListener("abort", () => {
    log.info("Connection aborted: client has disconnected");
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

function hasLessonPlan(obj: unknown): obj is { lessonPlan: unknown } {
  return obj !== null && typeof obj === "object" && "lessonPlan" in obj;
}

function isValidLessonPlan(lessonPlan: unknown): boolean {
  return lessonPlan !== null && typeof lessonPlan === "object";
}

function parseLessonPlanFromOutput(output: unknown): LooseLessonPlan {
  if (!output) return {};

  try {
    const parsedOutput =
      typeof output === "string" ? JSON.parse(output) : output;

    if (
      hasLessonPlan(parsedOutput) &&
      isValidLessonPlan(parsedOutput.lessonPlan)
    ) {
      return parsedOutput.lessonPlan as LooseLessonPlan;
    }
  } catch (error) {
    log.error("Error parsing output to extract lesson plan", error);
  }

  return {};
}

async function loadLessonPlanFromDatabase(
  chatId: string,
  userId: string,
): Promise<LooseLessonPlan> {
  try {
    const chat = await prisma.appSession.findUnique({
      where: { id: chatId },
      select: {
        id: true,
        userId: true,
        output: true,
      },
    });

    if (!chat) {
      log.info(`No existing chat found for id: ${chatId}`);
      return {};
    }

    if (chat.userId !== userId) {
      log.error(
        `User ${userId} attempted to access chat ${chatId} which belongs to ${chat.userId}`,
      );
      throw new Error("Unauthorized access to chat");
    }

    const lessonPlan = parseLessonPlanFromOutput(chat.output);
    log.info(`Loaded lesson plan for chat ${chatId}`);
    return lessonPlan;
  } catch (error) {
    log.error(`Error loading lesson plan for chat ${chatId}`, error);
    return {};
  }
}

export async function handleChatPostRequest(
  req: NextRequest,
  config: Config,
): Promise<Response> {
  return await withTelemetry("chat-api", {}, async (span: TracingSpan) => {
    const {
      chatId,
      messages,
      options,
      llmService,
      moderationAiClient,
      threatDetectors,
    } = await setupChatHandler(req);

    let userId: string | undefined;
    let aila: Aila | undefined;

    try {
      userId = await fetchAndCheckUser(chatId);
      span.setTag("user_id", userId);

      const dbLessonPlan = await loadLessonPlanFromDatabase(chatId, userId);

      setTelemetryMetadata({
        span,
        id: chatId,
        messages,
        lessonPlan: dbLessonPlan,
        options,
      });

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
              americanismsService: () =>
                new AilaAmericanisms<LooseLessonPlan>(),
              analyticsAdapters: (aila: AilaServices) => [
                new PosthogAnalyticsAdapter(aila),
                new DatadogAnalyticsAdapter(aila),
              ],
              threatDetectors: () => threatDetectors,
            },
            document: {
              content: dbLessonPlan ?? {},
              schema: LessonPlanSchema,
              categorisationPlugin: (aila: AilaServices) =>
                new LessonPlanCategorisationPlugin(
                  new AilaCategorisation({ aila }),
                ),
            },
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

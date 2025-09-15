import { DEFAULT_QUIZ_GENERATORS } from "@oakai/aila/src/constants";
import type { Aila } from "@oakai/aila/src/core/Aila";
import type { AilaServices } from "@oakai/aila/src/core/AilaServices";
import type { Message } from "@oakai/aila/src/core/chat";
import type { QuizGeneratorType } from "@oakai/aila/src/core/quiz/schema";
import type {
  AilaInitializationOptions,
  AilaOptions,
  AilaPublicChatOptions,
} from "@oakai/aila/src/core/types";
import { AilaAmericanisms } from "@oakai/aila/src/features/americanisms/AilaAmericanisms";
import {
  DatadogAnalyticsAdapter,
  PosthogAnalyticsAdapter,
} from "@oakai/aila/src/features/analytics";
import { AilaRag } from "@oakai/aila/src/features/rag/AilaRag";
import type { AilaThreatDetector } from "@oakai/aila/src/features/threatDetection";
import { HeliconeThreatDetector } from "@oakai/aila/src/features/threatDetection/detectors/helicone/HeliconeThreatDetector";
import { LakeraThreatDetector } from "@oakai/aila/src/features/threatDetection/detectors/lakera/LakeraThreatDetector";
import { SentryTracingService } from "@oakai/aila/src/features/tracing";
import type { PartialLessonPlan } from "@oakai/aila/src/protocol/schema";
import { startSpan } from "@oakai/core/src/tracing";
import type { TracingSpan } from "@oakai/core/src/tracing";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { prisma as globalPrisma } from "@oakai/db/client";
import { aiLogger } from "@oakai/logger";

import { captureException } from "@sentry/nextjs";
import * as Sentry from "@sentry/node";
import type { NextRequest } from "next/server";
import invariant from "tiny-invariant";

import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import type { Config } from "./config";
import { handleChatException } from "./errorHandling";
import {
  getFixtureLLMService,
  getFixtureModerationOpenAiClient,
} from "./fixtures";
import { fetchAndCheckUser } from "./user";

const log = aiLogger("chat");

function getQuizGenerators(): QuizGeneratorType[] {
  const envValue = process.env.AILA_QUIZ_GENERATORS;
  if (envValue) {
    const generators = envValue.split(",").map((g) => g.trim());
    const validGenerators = generators.filter((g): g is QuizGeneratorType =>
      ["rag", "ml", "basedOnRag"].includes(g),
    );
    if (validGenerators.length > 0) {
      return validGenerators;
    }
  }
  // Default fallback
  return DEFAULT_QUIZ_GENERATORS;
}

export const maxDuration = 300;

const prisma: PrismaClientWithAccelerate = globalPrisma;

export async function GET() {
  return Promise.resolve(new Response("Chat API is working", { status: 200 }));
}

async function setupChatHandler(req: NextRequest) {
  return await startSpan(
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

      const useAgenticAila = await serverSideFeatureFlag("agentic-aila-may-25");

      const options: AilaOptions = {
        useRag: chatOptions.useRag ?? true,
        temperature: chatOptions.temperature ?? 0.7,
        numberOfRecordsInRag: chatOptions.numberOfRecordsInRag ?? 5,
        quizGenerators: getQuizGenerators(),
        usePersistence: true,
        useModeration: true,
        useAgenticAila,
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
  return await Sentry.startSpanManual(
    {
      name: "chat-aila-generate",
      attributes: { chat_id: aila.chatId, user_id: aila.userId },
    },
    async (_span, finishSpan) => {
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

        const stream = result
          .pipeThrough(transformStream)
          // Manually finish the span when the stream closes, as we can't just await it like a normal automatic span
          .pipeThrough(
            new TransformStream({
              flush: () => finishSpan(),
            }),
          );

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

function hasMessages(obj: unknown): obj is { messages: unknown } {
  return obj !== null && typeof obj === "object" && "messages" in obj;
}

function isValidMessages(messages: unknown): boolean {
  return Array.isArray(messages);
}

function verifyChatOwnership(
  chat: { userId: string },
  requestUserId: string,
  chatId: string,
): void {
  if (chat.userId !== requestUserId) {
    log.error(
      `User ${requestUserId} attempted to access chat ${chatId} which belongs to ${chat.userId}`,
    );
    throw new Error("Unauthorized access to chat");
  }
}

function parseChatOutput(
  output: unknown,
  chatId: string,
): { messages: Message[]; lessonPlan: PartialLessonPlan } {
  let messages: Message[] = [];
  let lessonPlan: PartialLessonPlan = {};

  try {
    const parsedOutput =
      typeof output === "string" ? JSON.parse(output) : output;

    if (hasMessages(parsedOutput) && isValidMessages(parsedOutput.messages)) {
      messages = parsedOutput.messages as Message[];
    }

    if (
      hasLessonPlan(parsedOutput) &&
      isValidLessonPlan(parsedOutput.lessonPlan)
    ) {
      lessonPlan = parsedOutput.lessonPlan as PartialLessonPlan;
    }
  } catch (error) {
    log.error(`Error parsing output for chat ${chatId}`, error);
    captureException(error, {
      extra: { chatId, output },
      tags: { context: "parseChatOutput" },
    });
  }

  return { messages, lessonPlan };
}

async function loadChatDataFromDatabase(
  chatId: string,
  userId: string,
): Promise<{ messages: Message[]; lessonPlan: PartialLessonPlan }> {
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
      return { messages: [], lessonPlan: {} };
    }

    verifyChatOwnership(chat, userId, chatId);

    const { messages, lessonPlan } = parseChatOutput(chat.output, chatId);

    log.info(
      `Loaded ${messages.length} messages and lesson plan for chat ${chatId}`,
    );
    return { messages, lessonPlan };
  } catch (error) {
    log.error(`Error loading chat data for chat ${chatId}`, error);
    captureException(error, {
      extra: { chatId, userId },
      tags: { context: "loadChatDataFromDatabase" },
    });
    throw error;
  }
}

function extractLatestUserMessage(frontendMessages: Message[]): Message | null {
  return (frontendMessages ?? []).findLast((m) => m?.role === "user") ?? null;
}

function prepareMessages(
  dbMessages: Message[],
  frontendMessages: Message[],
  chatId: string,
): Message[] {
  const latestUserMessage = extractLatestUserMessage(frontendMessages);

  let messages = [...dbMessages];
  if (
    latestUserMessage &&
    !messages.some((m) => m.id === latestUserMessage.id)
  ) {
    messages.push(latestUserMessage);
    log.info(`Appended new user message to history for chat ${chatId}`);
  }

  return messages;
}

type CreateAilaInstanceArguments = {
  config: Config;
  options: AilaOptions;
  chatId: string;
  userId: string | undefined;
  messages: Message[];
  lessonPlan: PartialLessonPlan;
  llmService: ReturnType<typeof getFixtureLLMService>;
  moderationAiClient: ReturnType<typeof getFixtureModerationOpenAiClient>;
  threatDetectors: AilaThreatDetector[];
};

async function createAilaInstance({
  config,
  options,
  chatId,
  userId,
  messages,
  lessonPlan,
  llmService,
  moderationAiClient,
  threatDetectors,
}: CreateAilaInstanceArguments): Promise<Aila> {
  return await startSpan(
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
          tracingService: new SentryTracingService(startSpan),
        },
        document: {
          content: lessonPlan ?? {},
        },
      };
      const result = await config.createAila(ailaOptions);
      return result;
    },
  );
}

export async function handleChatPostRequest(
  req: NextRequest,
  config: Config,
): Promise<Response> {
  return await startSpan("chat-api", {}, async (span: TracingSpan) => {
    const {
      chatId,
      messages: frontendMessages,
      options,
      llmService,
      moderationAiClient,
      threatDetectors,
    } = await setupChatHandler(req);
    span.setAttributes({ chat_id: chatId });

    let userId: string | undefined;
    let aila: Aila | undefined;

    try {
      userId = await fetchAndCheckUser(chatId);

      const { messages: dbMessages, lessonPlan: dbLessonPlan } =
        await loadChatDataFromDatabase(chatId, userId);

      const messages = prepareMessages(dbMessages, frontendMessages, chatId);

      aila = await createAilaInstance({
        config,
        options,
        chatId,
        userId,
        messages,
        lessonPlan: dbLessonPlan,
        llmService,
        moderationAiClient,
        threatDetectors,
      });
      invariant(aila, "Aila instance is required");

      const abortController = handleConnectionAborted(req);
      const stream = await generateChatStream(aila, abortController);
      return stream;
    } catch (e) {
      return handleChatException(e, chatId, prisma);
    } finally {
      if (aila) {
        await aila.ensureShutdown();
      }
    }
  });
}

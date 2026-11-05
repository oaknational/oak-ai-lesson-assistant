import { DEFAULT_QUIZ_SOURCES } from "@oakai/aila/src/constants";
import type { Aila } from "@oakai/aila/src/core/Aila";
import type { AilaServices } from "@oakai/aila/src/core/AilaServices";
import type { Message } from "@oakai/aila/src/core/chat";
import type { QuestionSourceType } from "@oakai/aila/src/core/quiz/schema";
import type {
  AilaInitializationOptions,
  AilaOptions,
} from "@oakai/aila/src/core/types";
import { AilaAmericanisms } from "@oakai/aila/src/features/americanisms/AilaAmericanisms";
import {
  DatadogAnalyticsAdapter,
  PosthogAnalyticsAdapter,
} from "@oakai/aila/src/features/analytics";
import type { AilaThreatDetector } from "@oakai/aila/src/features/threatDetection";
import { SentryTracingService } from "@oakai/aila/src/features/tracing";
import type { PartialLessonPlan } from "@oakai/aila/src/protocol/schema";
import { migrateChatData } from "@oakai/aila/src/protocol/schemas/versioning/migrateChatData";
import { serverSideFeatureFlag } from "@oakai/api/src/utils/serverSideFeatureFlag";
import { startSpan } from "@oakai/core/src/tracing";
import type { TracingSpan } from "@oakai/core/src/tracing";
import { asPrismaJson } from "@oakai/db";
import type { OakPrismaClient } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import { captureException } from "@sentry/nextjs";
import * as Sentry from "@sentry/node";
import type { NextRequest } from "next/server";
import invariant from "tiny-invariant";
import { z } from "zod";

import type { Config } from "./configTypes";
import { handleChatException } from "./errorHandling";
import {
  getAgenticFixtureConfig,
  getFixtureModerationOpenAiClient,
  getFixtureOakModerator,
} from "./fixtures";
import { formatChatResponse } from "./streamProtocol";
import { getThreatDetectors } from "./threatDetectors";
import { fetchAndCheckUser } from "./user";

const log = aiLogger("chat");

function getQuizSources(): QuestionSourceType[] {
  const envValue = process.env.AILA_QUIZ_SOURCES;
  if (envValue) {
    const sources = envValue.split(",").map((s) => s.trim());
    const validSources = sources.filter((s): s is QuestionSourceType =>
      [
        "currentQuiz",
        "similarLessons",
        "basedOnLesson",
        "multiQuerySemantic",
      ].includes(s),
    );
    if (validSources.length > 0) {
      return validSources;
    }
  }
  // Default fallback
  return DEFAULT_QUIZ_SOURCES;
}

export const maxDuration = 300;

export async function GET() {
  return Promise.resolve(new Response("Chat API is working", { status: 200 }));
}

async function setupChatHandler(req: NextRequest) {
  return await startSpan(
    "chat-setup-chat-handler",
    {},
    async (_span: TracingSpan) => {
      const json = await req.json();
      const { id: chatId, messages }: { id: string; messages: Message[] } =
        json;

      const agenticFixture = getAgenticFixtureConfig(req.headers);

      const useMathsQuizRag = await serverSideFeatureFlag("quiz-rag");

      const options: AilaOptions = {
        quizSources: getQuizSources(),
        usePersistence: true,
        useModeration: true,
        agenticFixture,
        useMathsQuizRag: useMathsQuizRag,
      };

      const moderationAiClient = getFixtureModerationOpenAiClient(
        req.headers,
        chatId,
      );
      const oakModerator = getFixtureOakModerator(req.headers);
      const threatDetectors = getThreatDetectors();

      return {
        chatId,
        messages,
        options,
        moderationAiClient,
        oakModerator,
        threatDetectors,
      };
    },
  );
}

function logConnectionAborted(req: NextRequest) {
  req.signal.addEventListener("abort", () => {
    log.info("Connection aborted: client has disconnected");
  });
}

async function generateChatStream(aila: Aila): Promise<Response> {
  return await Sentry.startSpanManual(
    {
      name: "chat-aila-generate",
      attributes: { chat_id: aila.chatId, user_id: aila.userId },
    },
    async (_span, finishSpan) => {
      try {
        invariant(aila, "Aila instance is required");
        const result = await aila.generate();
        // The client reads the response as a plain text stream
        const transformStream = new TransformStream<string, Uint8Array>({
          transform(chunk, controller) {
            controller.enqueue(new TextEncoder().encode(chunk));
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

async function loadGenerationContext(
  chatId: string,
  userId: string,
  prisma: OakPrismaClient,
): Promise<{ messages: Message[]; lessonPlan: PartialLessonPlan }> {
  try {
    const chat = await prisma.appSession.findUnique({
      where: { id: chatId },
      select: {
        id: true,
        userId: true,
        output: true,
        threatDetections: { select: { messageId: true } },
      },
    });

    if (!chat) {
      log.info(`No existing chat found for id: ${chatId}`);
      return { messages: [], lessonPlan: {} };
    }

    verifyChatOwnership(chat, userId, chatId);

    const output = z
      .object({ lessonPlan: z.record(z.string(), z.unknown()) })
      .passthrough()
      .parse(chat.output ?? {});

    output.lessonPlan = output.lessonPlan ?? {};

    const { messages: allMessages, lessonPlan } = await migrateChatData(
      output,
      async (upgradedData) => {
        await prisma.appSession.update({
          where: { id: chat.id },
          data: { output: asPrismaJson(upgradedData) },
        });
      },
      {
        id: chat.id,
        userId,
        caller: "chatHandler.loadGenerationContext",
      },
    );

    const threatenedMessageIds = new Set(
      chat.threatDetections
        .map((td) => td.messageId)
        .filter((id): id is string => id !== null),
    );
    const messages =
      threatenedMessageIds.size > 0
        ? allMessages.filter((m) => !threatenedMessageIds.has(m.id))
        : allMessages;

    log.info(
      `Loaded ${messages.length} messages and lesson plan for chat ${chatId}`,
    );
    return { messages, lessonPlan };
  } catch (error) {
    log.error(`Error loading chat data for chat ${chatId}`, error);
    captureException(error, {
      extra: { chatId, userId },
      tags: { context: "loadGenerationContext" },
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
  moderationAiClient: ReturnType<typeof getFixtureModerationOpenAiClient>;
  oakModerator: ReturnType<typeof getFixtureOakModerator>;
  threatDetectors: AilaThreatDetector[];
};

async function createAilaInstance({
  config,
  options,
  chatId,
  userId,
  messages,
  lessonPlan,
  moderationAiClient,
  oakModerator,
  threatDetectors,
}: CreateAilaInstanceArguments): Promise<Aila> {
  return await startSpan(
    "chat-create-aila",
    { chat_id: chatId, user_id: userId },
    async (): Promise<Aila> => {
      const ailaOptions: Partial<AilaInitializationOptions> = {
        prisma: config.prisma,
        options,
        chat: {
          id: chatId,
          userId,
          messages,
        },
        services: {
          moderationAiClient,
          oakModerator,
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
    let chatId: string;
    let aila: Aila | undefined;
    let userId: string | undefined;
    try {
      const {
        chatId: resolvedChatId,
        messages: frontendMessages,
        options,
        moderationAiClient,
        oakModerator,
        threatDetectors,
      } = await setupChatHandler(req);

      chatId = resolvedChatId;
      userId = await fetchAndCheckUser(chatId);
      span.setAttributes({ chat_id: chatId });

      const { messages: dbMessages, lessonPlan: dbLessonPlan } =
        await loadGenerationContext(chatId, userId, config.prisma);

      const messages = prepareMessages(dbMessages, frontendMessages, chatId);

      aila = await createAilaInstance({
        config,
        options,
        chatId,
        userId,
        messages,
        lessonPlan: dbLessonPlan,
        moderationAiClient,
        oakModerator,
        threatDetectors,
      });
      invariant(aila, "Aila instance is required");

      logConnectionAborted(req);
      return formatChatResponse(req, await generateChatStream(aila));
    } catch (e) {
      return formatChatResponse(req, await handleChatException(e));
    } finally {
      if (aila) {
        await aila.ensureShutdown();
      }
    }
  });
}

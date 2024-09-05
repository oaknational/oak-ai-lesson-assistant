import {
  Aila,
  AilaAuthenticationError,
  AilaThreatDetectionError,
} from "@oakai/aila";
import type { AilaOptions, AilaPublicChatOptions, Message } from "@oakai/aila";
import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { handleHeliconeError } from "@oakai/aila/src/utils/moderation/moderationErrorHandling";
import {
  TracingSpan,
  withTelemetry,
} from "@oakai/core/src/tracing/serverTracing";
import { PrismaClientWithAccelerate, prisma as globalPrisma } from "@oakai/db";
import { StreamingTextResponse } from "ai";
import { NextRequest, NextResponse } from "next/server";
import invariant from "tiny-invariant";

import { Config } from "./config";
import { streamingJSON } from "./protocol";

export const maxDuration = 300;

const prisma: PrismaClientWithAccelerate = globalPrisma;

export async function GET() {
  return new Response("Chat API is working", { status: 200 });
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

      span.setTag("chat_id", chatId);
      span.setTag("messages.count", messages.length);
      span.setTag("options", JSON.stringify(options));

      return { chatId, messages, lessonPlan, options };
    },
  );
}

function reportErrorTelemetry(
  span: TracingSpan,
  error: Error,
  errorType: string,
  statusMessage: string,
  additionalAttributes: Record<
    string,
    string | number | boolean | undefined
  > = {},
) {
  span.setTag("error", true);
  span.setTag("error.type", errorType);
  span.setTag("error.message", statusMessage);
  span.setTag("error.stack", error.stack);
  Object.entries(additionalAttributes).forEach(([key, value]) => {
    span.setTag(key, value);
  });
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
    console.log("Client has disconnected");
    abortController.abort();
  });
  return abortController;
}

async function handleThreatDetectionError(
  span: TracingSpan,
  e: AilaThreatDetectionError,
  userId: string,
  id: string,
  prisma: PrismaClientWithAccelerate,
) {
  const heliconeErrorMessage = await handleHeliconeError(userId, id, e, prisma);
  reportErrorTelemetry(span, e, "AilaThreatDetectionError", "Threat detected");
  return streamingJSON(heliconeErrorMessage);
}

async function handleAilaAuthenticationError(
  span: TracingSpan,
  e: AilaAuthenticationError,
) {
  reportErrorTelemetry(span, e, "AilaAuthenticationError", "Unauthorized");
  return new Response("Unauthorized", { status: 401 });
}

async function handleGenericError(span: TracingSpan, e: Error) {
  reportErrorTelemetry(span, e, e.name, e.message);
  return streamingJSON({
    type: "error",
    message: e.message,
    value: `Sorry, an error occurred: ${e.message}`,
  });
}

async function getUserId(config: Config, chatId: string): Promise<string> {
  return await withTelemetry(
    "chat-get-user-id",
    { chat_id: chatId },
    async (userIdSpan: TracingSpan) => {
      if (config.shouldPerformUserLookup) {
        const userLookup = await config.handleUserLookup(chatId);
        userIdSpan.setTag("user.lookup.performed", true);

        if ("failureResponse" in userLookup) {
          if (userLookup.failureResponse) {
            throw new Error("User lookup failed: failureResponse received");
          }
        }

        if ("userId" in userLookup) {
          userIdSpan.setTag("user_id", userLookup.userId);
          return userLookup.userId;
        }

        throw new Error("User lookup failed: userId not found");
      }
      invariant(config.mockUserId, "User ID is required");
      userIdSpan.setTag("user_id", config.mockUserId);
      userIdSpan.setTag("user.mock", true);
      return config.mockUserId;
    },
  );
}

async function generateChatStream(
  aila: Aila,
  abortController: AbortController,
) {
  return await withTelemetry(
    "chat-aila-generate",
    { chat_id: aila.chatId, user_id: aila.userId },
    async () => {
      invariant(aila, "Aila instance is required");
      const result = await aila.generate({ abortController });
      const transformStream = new TransformStream({
        transform(chunk, controller) {
          const formattedChunk = `0:${JSON.stringify(chunk)}\n`;
          controller.enqueue(formattedChunk);
        },
      });

      return result.pipeThrough(transformStream);
    },
  );
}

async function handleChatException(
  span: TracingSpan,
  e: unknown,
  userId: string | undefined,
  chatId: string,
  prisma: PrismaClientWithAccelerate,
): Promise<Response> {
  if (e instanceof AilaAuthenticationError) {
    return handleAilaAuthenticationError(span, e);
  }

  if (e instanceof AilaThreatDetectionError && userId) {
    return handleThreatDetectionError(span, e, userId, chatId, prisma);
  }

  if (e instanceof Error) {
    return handleGenericError(span, e);
  }

  throw e;
}

export async function handleChatPostRequest(
  req: NextRequest,
  config: Config,
): Promise<Response> {
  return await withTelemetry("chat-api", {}, async (span: TracingSpan) => {
    const { chatId, messages, lessonPlan, options } =
      await setupChatHandler(req);
    setTelemetryMetadata(span, chatId, messages, lessonPlan, options);

    let userId: string | undefined;
    let aila: Aila | undefined;

    try {
      userId = await getUserId(config, chatId);
      span.setTag("user_id", userId);
      aila = await withTelemetry(
        "chat-create-aila",
        { chat_id: chatId, user_id: userId },
        async (): Promise<Aila> => {
          const result = await config.createAila({
            options,
            chat: {
              id: chatId,
              userId,
              messages,
            },
            lessonPlan,
          });
          return result;
        },
      );
      invariant(aila, "Aila instance is required");

      const abortController = handleConnectionAborted(req);
      const stream = await generateChatStream(aila, abortController);
      return new StreamingTextResponse(stream);
    } catch (e) {
      return handleChatException(span, e, userId, chatId, prisma);
    } finally {
      if (aila) {
        await aila.ensureShutdown();
      }
    }
  });
}

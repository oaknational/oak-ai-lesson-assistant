import {
  Aila,
  AilaAuthenticationError,
  AilaThreatDetectionError,
} from "@oakai/aila";
import type { AilaOptions, AilaPublicChatOptions, Message } from "@oakai/aila";
import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { handleHeliconeError } from "@oakai/aila/src/utils/moderation/moderationErrorHandling";
import { tracer } from "@oakai/core/src/tracing/serverTracing";
import { PrismaClientWithAccelerate, prisma as globalPrisma } from "@oakai/db";
import {
  SpanContext,
  Span,
  SpanStatusCode,
  TraceFlags,
} from "@opentelemetry/api";
import { TraceState } from "@opentelemetry/core";
import { StreamingTextResponse } from "ai";
import { NextRequest } from "next/server";
import invariant from "tiny-invariant";

import { Config } from "./config";
import { streamingJSON } from "./protocol";

export const maxDuration = 300;

const prisma: PrismaClientWithAccelerate = globalPrisma;

export async function GET() {
  return new Response("Chat API is working", { status: 200 });
}

async function setupChatHandler(req: NextRequest) {
  const json = await req.json();
  const {
    id: chatId,
    messages,
    lessonPlan = {},
    options: chatOptions = {},
    traceContext: serializedTraceContext,
  }: {
    id: string;
    messages: Message[];
    lessonPlan?: LooseLessonPlan;
    options?: AilaPublicChatOptions;
    traceContext?: {
      traceId: string;
      spanId: string;
      traceFlags: number;
      traceState?: string;
    };
  } = json;

  let traceContext: SpanContext | undefined;
  if (serializedTraceContext) {
    traceContext = {
      traceId: serializedTraceContext.traceId,
      spanId: serializedTraceContext.spanId,
      traceFlags: serializedTraceContext.traceFlags as TraceFlags,
      traceState: serializedTraceContext.traceState
        ? new TraceState(serializedTraceContext.traceState)
        : undefined,
    };
  }

  const options: AilaOptions = {
    useRag: chatOptions.useRag ?? true,
    temperature: chatOptions.temperature ?? 0.7,
    numberOfLessonPlansInRag: chatOptions.numberOfLessonPlansInRag ?? 5,
    usePersistence: true,
    useModeration: true,
  };

  return { chatId, messages, lessonPlan, options, traceContext };
}

function reportErrorTelemetry(
  span: Span,
  error: Error,
  errorType: string,
  statusMessage: string,
  additionalAttributes: Record<string, unknown> = {},
) {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR, message: statusMessage });
  span.setAttributes({
    errorType,
    errorStack: error.stack,
    ...additionalAttributes,
  });
}

function setTelemetryMetadata(
  span: Span,
  id: string,
  messages: Message[],
  lessonPlan: LooseLessonPlan,
  options: AilaOptions,
) {
  span.setAttributes({
    chatId: id,
    messageCount: messages.length,
    hasLessonPlan: Object.keys(lessonPlan).length > 0,
    useRag: options.useRag,
    temperature: options.temperature,
    numberOfLessonPlansInRag: options.numberOfLessonPlansInRag,
    usePersistence: options.usePersistence,
    useModeration: options.useModeration,
  });
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
  span: Span,
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
  span: Span,
  e: AilaAuthenticationError,
) {
  reportErrorTelemetry(span, e, "AilaAuthenticationError", "Unauthorized");
  return new Response("Unauthorized", { status: 401 });
}

async function handleGenericError(span: Span, e: Error) {
  reportErrorTelemetry(span, e, e.name, e.message);
  return streamingJSON({
    type: "error",
    message: e.message,
    value: `Sorry, an error occurred: ${e.message}`,
  });
}

async function getUserId(
  config: Config,
  span: Span,
  id: string,
): Promise<string> {
  if (config.shouldPerformUserLookup) {
    const userLookup = await config.handleUserLookup(span, id);

    if (!userLookup) {
      throw new Error("User lookup failed");
    }

    if ("failureResponse" in userLookup) {
      if (userLookup.failureResponse) {
        throw new Error("User lookup failed: failureResponse received");
      }
    }

    if ("userId" in userLookup) {
      return userLookup.userId;
    }

    throw new Error("User lookup failed: userId not found");
  }
  invariant(config.mockUserId, "User ID is required");

  return config.mockUserId;
}

async function generateChatStream(
  aila: Aila,
  abortController: AbortController,
) {
  return tracer.startActiveSpan("chat-aila-generate", async (generateSpan) => {
    invariant(aila, "Aila instance is required");
    const result = await aila.generate({ abortController });
    generateSpan.end();
    return result;
  });
}

async function handleChatException(
  span: Span,
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
  const { chatId, messages, lessonPlan, options, traceContext } =
    await setupChatHandler(req);

  const span = tracer.startSpan("chat-api", {
    links: traceContext ? [{ context: traceContext }] : [],
  });

  let userId: string | undefined;
  let aila: Aila | undefined;

  try {
    setTelemetryMetadata(span, chatId, messages, lessonPlan, options);

    userId = await getUserId(config, span, chatId);

    aila = await config.createAila({
      options,
      chat: {
        id: chatId,
        userId,
        messages,
      },
      lessonPlan,
    });

    const abortController = handleConnectionAborted(req);
    const stream = await generateChatStream(aila, abortController);
    return new StreamingTextResponse(stream);
  } catch (e) {
    return handleChatException(span, e, userId, chatId, prisma);
  } finally {
    if (aila) {
      await aila.ensureShutdown();
    }
    span.end();
  }
}

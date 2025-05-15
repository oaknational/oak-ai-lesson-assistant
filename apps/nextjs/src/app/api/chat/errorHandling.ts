import { AilaAuthenticationError } from "@oakai/aila/src/core/AilaError";
import { AilaThreatDetectionError } from "@oakai/aila/src/features/threatDetection";
import type {
  ActionDocument,
  ErrorDocument,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { handleThreatDetectionError } from "@oakai/aila/src/utils/threatDetection/threatDetectionHandling";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import type { TracingSpan } from "@oakai/core/src/tracing/serverTracing";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/errors";
import type { PrismaClientWithAccelerate } from "@oakai/db";

import { streamingJSON } from "./protocol";

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

async function handleThreatError(
  span: TracingSpan,
  e: AilaThreatDetectionError,
  id: string,
  prisma: PrismaClientWithAccelerate,
) {
  const threatErrorMessage = await handleThreatDetectionError({
    userId: e.userId,
    chatId: id,
    error: e,
    prisma,
  });
  reportErrorTelemetry(span, e, "AilaThreatDetectionError", "Threat detected");
  return streamingJSON(threatErrorMessage);
}

async function handleAilaAuthenticationError(
  span: TracingSpan,
  e: AilaAuthenticationError,
): Promise<Response> {
  reportErrorTelemetry(span, e, "AilaAuthenticationError", "Unauthorized");
  return Promise.resolve(new Response("Unauthorized", { status: 401 }));
}

export async function handleRateLimitError(
  span: TracingSpan,
  error: RateLimitExceededError,
): Promise<Response> {
  reportErrorTelemetry(span, error, "RateLimitExceededError", "Rate limited");

  const timeRemainingHours = Math.ceil(
    (error.reset - Date.now()) / 1000 / 60 / 60,
  );
  const hours = timeRemainingHours === 1 ? "hour" : "hours";

  return Promise.resolve(
    streamingJSON({
      type: "error",
      value: error.message,
      message: `**Unfortunately you’ve exceeded your fair usage limit for today.** Please come back in ${timeRemainingHours} ${hours}. If you require a higher limit, please [make a request](${process.env.RATELIMIT_FORM_URL}).`,
    } as ErrorDocument),
  );
}

async function handleUserBannedError(): Promise<Response> {
  return Promise.resolve(
    streamingJSON({
      type: "action",
      action: "SHOW_ACCOUNT_LOCKED",
    } as ActionDocument),
  );
}

async function handleGenericError(
  span: TracingSpan,
  e: Error,
): Promise<Response> {
  reportErrorTelemetry(span, e, e.name, e.message);
  return Promise.resolve(
    streamingJSON({
      type: "error",
      message: e.message,
      value: `Sorry, an error occurred: ${e.message}`,
    } as ErrorDocument),
  );
}

export async function handleChatException(
  span: TracingSpan,
  e: unknown,
  chatId: string,
  prisma: PrismaClientWithAccelerate,
): Promise<Response> {
  if (e instanceof AilaAuthenticationError) {
    return handleAilaAuthenticationError(span, e);
  }

  if (e instanceof AilaThreatDetectionError) {
    return handleThreatError(span, e, chatId, prisma);
  }

  if (e instanceof RateLimitExceededError) {
    return handleRateLimitError(span, e);
  }

  if (e instanceof UserBannedError) {
    return handleUserBannedError();
  }

  if (e instanceof Error) {
    return handleGenericError(span, e);
  }

  throw e;
}

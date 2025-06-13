import { AilaAuthenticationError } from "@oakai/aila/src/core/AilaError";
import { AilaThreatDetectionError } from "@oakai/aila/src/features/threatDetection";
import type {
  ActionDocument,
  ErrorDocument,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { handleThreatDetectionError } from "@oakai/aila/src/utils/threatDetection/threatDetectionHandling";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/errors";
import type { PrismaClientWithAccelerate } from "@oakai/db";

import * as Sentry from "@sentry/node";

import { streamingJSON } from "./protocol";

async function handleThreatError(
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
  return streamingJSON(threatErrorMessage);
}

async function handleAilaAuthenticationError(): Promise<Response> {
  return Promise.resolve(new Response("Unauthorized", { status: 401 }));
}

export async function handleRateLimitError(
  error: RateLimitExceededError,
): Promise<Response> {
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

async function handleGenericError(e: Error): Promise<Response> {
  return Promise.resolve(
    streamingJSON({
      type: "error",
      message: e.message,
      value: `Sorry, an error occurred: ${e.message}`,
    } as ErrorDocument),
  );
}

export async function handleChatException(
  e: unknown,
  chatId: string,
  prisma: PrismaClientWithAccelerate,
): Promise<Response> {
  if (e instanceof AilaAuthenticationError) {
    return handleAilaAuthenticationError();
  }

  if (e instanceof AilaThreatDetectionError) {
    return handleThreatError(e, chatId, prisma);
  }

  if (e instanceof RateLimitExceededError) {
    return handleRateLimitError(e);
  }

  if (e instanceof UserBannedError) {
    return handleUserBannedError();
  }

  Sentry.captureException(
    new Error("Unexpected error in chat route", { cause: e }),
  );

  if (e instanceof Error) {
    return handleGenericError(e);
  }

  throw e;
}

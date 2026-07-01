import { AilaAuthenticationError } from "@oakai/aila/src/core/AilaError";
import type {
  ActionDocument,
  ErrorDocument,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { UserBannedError } from "@oakai/core";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/errors";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/node";
import { APICallError } from "ai";
import { APIError } from "openai";

import { streamingJSON } from "./protocol";

const log = aiLogger("chat");

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
  log.error("Unhandled chat error", e);
  return Promise.resolve(
    streamingJSON({
      type: "error",
      message: "An unexpected error occurred",
      value: "Sorry, an unexpected error occurred. Please try again later.",
    } as ErrorDocument),
  );
}

type UpstreamAIProviderError = {
  statusCode: number;
  requestId?: string | null;
  url?: string;
};

function getUpstreamAIProviderError(
  error: unknown,
): UpstreamAIProviderError | null {
  let current: unknown = error;

  while (current) {
    if (
      APICallError.isInstance(current) &&
      current.statusCode !== undefined &&
      current.statusCode >= 500
    ) {
      return {
        statusCode: current.statusCode,
        url: current.url,
      };
    }

    if (
      current instanceof APIError &&
      current.status !== undefined &&
      current.status >= 500
    ) {
      return {
        statusCode: current.status,
        requestId: current.requestID,
      };
    }

    current =
      current instanceof Error && "cause" in current ? current.cause : null;
  }

  return null;
}

async function handleUpstreamAIProviderError(
  e: Error,
  providerError: UpstreamAIProviderError,
): Promise<Response> {
  log.warn("Upstream AI provider error", providerError);
  Sentry.captureMessage("Upstream AI provider error", {
    level: "warning",
    extra: {
      ...providerError,
      cause: e.message,
    },
  });

  return Promise.resolve(
    streamingJSON({
      type: "error",
      message: "The AI service is temporarily unavailable",
      value:
        "The AI service is temporarily unavailable. Please try again shortly.",
    } as ErrorDocument),
  );
}

export async function handleChatException(e: unknown): Promise<Response> {
  if (e instanceof AilaAuthenticationError) {
    return handleAilaAuthenticationError();
  }

  if (e instanceof RateLimitExceededError) {
    return handleRateLimitError(e);
  }

  if (e instanceof UserBannedError) {
    return handleUserBannedError();
  }

  if (e instanceof Error) {
    const upstreamProviderError = getUpstreamAIProviderError(e);
    if (upstreamProviderError) {
      return handleUpstreamAIProviderError(e, upstreamProviderError);
    }
  }

  Sentry.captureException(
    new Error("Unexpected error in chat route", { cause: e }),
  );

  if (e instanceof Error) {
    return handleGenericError(e);
  }

  throw e;
}

import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import { TRPCClientError } from "@trpc/client";

import { type ErrorType, type ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

export const handleStoreError = (
  set: ResourcesSetter,
  error: unknown,
  context: Record<string, unknown> = {},
): void => {
  let errorType: ErrorType = "unknown";
  let errorMessage = "An unknown error occurred";

  // Handle TRPCClientError
  if (error instanceof TRPCClientError) {
    log.error("TRPCClientError detected", {
      message: error.message,
      shape: error.shape,
      data: error.data,
      ...context,
    });

    errorMessage = error.message;

    // Determine error type based on message content
    if (errorMessage.includes("RateLimitExceededError")) {
      errorType = "rate_limit";
    } else if (errorMessage.includes("UserBannedError")) {
      errorType = "banned";
    }
  }
  // Handle standard Error
  else if (error instanceof Error) {
    errorMessage = error.message || errorMessage;
  }
  // Handle non-Error objects
  else if (error) {
    errorMessage = String(error);
  }

  // Update store with error information
  set({
    error: {
      type: errorType,
      message: errorMessage,
    },
  });

  log.error("Set error state:", {
    errorType,
    errorMessage,
    ...context,
  });

  // Report to Sentry
  Sentry.captureException(error);
};

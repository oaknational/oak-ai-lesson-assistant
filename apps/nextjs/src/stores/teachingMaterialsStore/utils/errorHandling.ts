import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import { TRPCClientError } from "@trpc/client";

import { type ErrorType, type TeachingMaterialsSetter } from "../types";

const log = aiLogger("teaching-materials");

export const handleStoreError = (
  set: TeachingMaterialsSetter,
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
  }
  // Handle standard Error
  else if (error instanceof Error) {
    errorMessage = error.message ?? errorMessage;
  }
  // Handle non-Error objects
  else if (error) {
    errorMessage = String(error);
  }

  if (errorMessage.includes("RateLimitExceededError")) {
    errorType = "rate_limit";
  } else if (errorMessage.includes("UserBannedError")) {
    errorType = "banned";
  } else if (errorMessage.includes("copyright")) {
    errorType = "copyright";
    errorMessage =
      "This lesson contains copyright-restricted assets and cannot be exported.";
  } else if (errorMessage.includes("content-guidance")) {
    errorType = "restrictedContentGuidance";
    errorMessage =
      "This lesson contains restricted content-guidance themes and cannot be generated.";
  } else if (errorMessage.includes("restricted-third-party-content")) {
    errorType = "restrictedThirdPartyContent";
    errorMessage =
      "This lesson contains restricted third-party content and cannot be generated.";
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

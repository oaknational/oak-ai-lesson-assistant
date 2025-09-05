import { aiLogger } from "@oakai/logger";

const log = aiLogger("additional-materials");
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Type guard for tRPC errors
function isTRPCError(error: unknown): error is { data?: { code?: string } } {
  return typeof error === "object" && error !== null && "data" in error;
}

// Type guard for HTTP errors
function isHTTPError(error: unknown): error is { status?: number } {
  return typeof error === "object" && error !== null && "status" in error;
}

// Type guard for TRPCClientError with HTML response (session not ready)
function isTRPCHTMLError(error: unknown): error is { message: string } {
  log.info("🔍 Checking if error is HTML response error", {
    errorType: typeof error,
    hasMessage:
      typeof error === "object" && error !== null && "message" in error,
    errorString: String(error).substring(0, 200), // First 200 chars for logging
  });

  const isHTMLError =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string" &&
    (error as { message: string }).message.includes(
      "Unexpected token '<', \"<!DOCTYPE",
    );

  if (isHTMLError) {
    log.info("✅ Detected HTML response error", {
      message: (error as { message: string }).message,
    });
  } else {
    log.info("❌ Not an HTML response error");
  }

  return isHTMLError;
}

export async function callWithHandshakeRetry<T>(
  fn: () => Promise<T>,
  refreshAuth?: () => Promise<void>,
  maxRetries: number = 3,
  delayMs: number = 300,
) {
  log.info("callWithHandshakeRetry started", {
    maxRetries,
    delayMs,
    hasRefreshAuth: !!refreshAuth,
  });
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    log.info(`Attempt ${attempt}/${maxRetries} starting`);
    try {
      return await fn();
    } catch (e: unknown) {
      lastError = e;
      log.info(`Attempt ${attempt} failed`, {
        error: e instanceof Error ? e.message : String(e),
        errorType: typeof e,
        isLastAttempt: attempt === maxRetries,
      });

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        log.info("Max retries reached, throwing error");
        throw e;
      }

      // Check for different error types to determine retry strategy
      const unauthorized =
        (isTRPCError(e) && e.data?.code === "UNAUTHORIZED") ||
        (isHTTPError(e) && e.status === 401);

      const sessionNotReady = isTRPCHTMLError(e);
      log.info("Error type analysis", {
        unauthorized,
        sessionNotReady,
        willRetry: attempt < maxRetries,
      });

      // For unauthorized errors, use the original delay
      // For session not ready (HTML response), use exponential backoff with longer delays
      // For other errors, use exponential backoff
      let delay: number;
      if (unauthorized) {
        delay = delayMs;
      } else if (sessionNotReady) {
        delay = attempt * 500; // 500ms, 1000ms, 1500ms for session propagation
      } else {
        delay = delayMs * Math.pow(2, attempt - 1);
      }

      // Log the retry attempt with context and refresh auth if needed
      if (sessionNotReady) {
        log.info(
          `Session not ready, retrying in ${delay}ms (${attempt}/${maxRetries})`,
        );
        // Try to refresh auth for session issues
        if (refreshAuth) {
          try {
            log.info("Refreshing user session before retry");
            await refreshAuth();
          } catch (refreshError) {
            log.warn("Failed to refresh auth", { refreshError });
          }
        }
      } else if (unauthorized) {
        log.info(
          `Unauthorized, retrying in ${delay}ms (${attempt}/${maxRetries})`,
        );
      } else {
        log.info(
          `Request failed, retrying in ${delay}ms (${attempt}/${maxRetries})`,
        );
      }

      await wait(delay);
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError;
}

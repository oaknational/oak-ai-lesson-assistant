import { aiLogger } from "@oakai/logger";

const log = aiLogger("teaching-materials");
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

// Helper to determine error types and retry strategy
function analyzeError(error: unknown) {
  const unauthorized =
    (isTRPCError(error) && error.data?.code === "UNAUTHORIZED") ||
    (isHTTPError(error) && error.status === 401);

  const sessionNotReady = isTRPCHTMLError(error);

  return { unauthorized, sessionNotReady };
}

// Helper to calculate retry delay based on error type and attempt
function calculateDelay(
  errorAnalysis: { unauthorized: boolean; sessionNotReady: boolean },
  attempt: number,
  baseDelayMs: number,
): number {
  const { unauthorized, sessionNotReady } = errorAnalysis;

  if (unauthorized) {
    return baseDelayMs;
  } else if (sessionNotReady) {
    return attempt * 500; // 500ms, 1000ms, 1500ms for session propagation
  } else {
    return baseDelayMs * Math.pow(2, attempt - 1);
  }
}

// Helper to handle auth refresh for session errors
async function handleAuthRefresh(
  errorAnalysis: { unauthorized: boolean; sessionNotReady: boolean },
  refreshAuth?: () => Promise<void>,
): Promise<void> {
  if (errorAnalysis.sessionNotReady && refreshAuth) {
    try {
      log.info("Refreshing user session before retry");
      await refreshAuth();
    } catch (refreshError) {
      log.warn("Failed to refresh auth", { refreshError });
    }
  }
}

// Helper to log retry information
function logRetryAttempt(
  errorAnalysis: { unauthorized: boolean; sessionNotReady: boolean },
  delay: number,
  attempt: number,
  maxRetries: number,
): void {
  const { unauthorized, sessionNotReady } = errorAnalysis;

  if (sessionNotReady) {
    log.info(
      `Session not ready, retrying in ${delay}ms (${attempt}/${maxRetries})`,
    );
  } else if (unauthorized) {
    log.info(`Unauthorized, retrying in ${delay}ms (${attempt}/${maxRetries})`);
  } else {
    log.info(
      `Request failed, retrying in ${delay}ms (${attempt}/${maxRetries})`,
    );
  }
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

      // Analyze error type to determine retry strategy
      const errorAnalysis = analyzeError(e);
      log.info("Error type analysis", {
        ...errorAnalysis,
        willRetry: attempt < maxRetries,
      });

      // Calculate appropriate delay based on error type
      const delay = calculateDelay(errorAnalysis, attempt, delayMs);

      // Handle auth refresh if needed
      await handleAuthRefresh(errorAnalysis, refreshAuth);

      // Log retry attempt with context
      logRetryAttempt(errorAnalysis, delay, attempt, maxRetries);

      await wait(delay);
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Type guard for tRPC errors
function isTRPCError(error: unknown): error is { data?: { code?: string } } {
  return typeof error === "object" && error !== null && "data" in error;
}

// Type guard for HTTP errors
function isHTTPError(error: unknown): error is { status?: number } {
  return typeof error === "object" && error !== null && "status" in error;
}

export async function callWithHandshakeRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 300,
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e: unknown) {
      lastError = e;

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw e;
      }

      // For unauthorized errors, use the original delay
      // For other errors, use exponential backoff
      const unauthorized =
        (isTRPCError(e) && e.data?.code === "UNAUTHORIZED") ||
        (isHTTPError(e) && e.status === 401);
      const delay = unauthorized ? delayMs : delayMs * Math.pow(2, attempt - 1);

      await wait(delay);
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError;
}

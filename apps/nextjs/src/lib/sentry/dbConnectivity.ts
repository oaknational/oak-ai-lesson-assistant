/**
 * Errors that mean the database couldn't be reached, rather than a problem
 * with a particular query.
 *
 * Prisma codes: P1001 can't reach the server, P1002 reached it but it timed
 * out, P1011 TLS failed, P1017 the server closed the connection, P2024 timed
 * out waiting for a pooled connection, P2037 too many connections.
 * @see https://www.prisma.io/docs/orm/reference/error-reference
 *
 * The pg driver adapter passes some network failures through with Node's own
 * error code instead, and reports others only by message. That includes the
 * pool being exhausted, which was P2024 in Prisma 6.
 */
const CONNECTIVITY_CODES = new Set([
  "P1001",
  "P1002",
  "P1011",
  "P1017",
  "P2024",
  "P2037",
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENOTFOUND",
  "ETIMEDOUT",
]);
const CONNECTIVITY_MESSAGES: Record<string, string> = {
  "Connection terminated due to connection timeout": "pg-connection-timeout",
  "Connection terminated unexpectedly": "pg-connection-terminated",
  "timeout exceeded when trying to connect": "pg-pool-exhausted",
};

export function getDbConnectivityCode(error: unknown): string | undefined {
  const seen = new Set<object>();
  while (typeof error === "object" && error !== null && !seen.has(error)) {
    seen.add(error);
    // Request errors carry `code`; initialisation errors carry `errorCode`.
    const codes = [
      "code" in error ? error.code : undefined,
      "errorCode" in error ? error.errorCode : undefined,
    ];
    for (const code of codes) {
      if (typeof code === "string" && CONNECTIVITY_CODES.has(code)) {
        return code;
      }
    }
    if ("message" in error && typeof error.message === "string") {
      const label = CONNECTIVITY_MESSAGES[error.message];
      if (label) {
        return label;
      }
    }
    error = "cause" in error ? error.cause : undefined;
  }
  return undefined;
}

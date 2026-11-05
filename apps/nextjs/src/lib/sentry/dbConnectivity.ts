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

/** Checks one error, ignoring its cause. */
function matchConnectivity(error: object): string | undefined {
  // Request errors carry `code`; initialisation errors carry `errorCode`.
  const codes = [
    "code" in error ? error.code : undefined,
    "errorCode" in error ? error.errorCode : undefined,
  ];
  const code = codes.find(
    (c): c is string => typeof c === "string" && CONNECTIVITY_CODES.has(c),
  );
  if (code) {
    return code;
  }
  const message = "message" in error ? error.message : undefined;
  return typeof message === "string"
    ? CONNECTIVITY_MESSAGES[message]
    : undefined;
}

export function getDbConnectivityCode(error: unknown): string | undefined {
  const seen = new Set<object>();
  while (typeof error === "object" && error !== null && !seen.has(error)) {
    seen.add(error);
    const match = matchConnectivity(error);
    if (match) {
      return match;
    }
    error = "cause" in error ? error.cause : undefined;
  }
  return undefined;
}

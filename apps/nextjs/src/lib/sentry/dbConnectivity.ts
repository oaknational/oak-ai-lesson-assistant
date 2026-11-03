/**
 * Prisma errors that mean the database couldn't be reached, rather than a
 * problem with a particular query.
 * P1001: can't reach the server. P1002: reached it, but it timed out.
 * P1017: the server closed the connection. P2024: timed out waiting for a
 * connection from the pool.
 * @see https://www.prisma.io/docs/orm/reference/error-reference
 */
const CONNECTIVITY_CODES = new Set(["P1001", "P1002", "P1017", "P2024"]);

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
    error = "cause" in error ? error.cause : undefined;
  }
  return undefined;
}

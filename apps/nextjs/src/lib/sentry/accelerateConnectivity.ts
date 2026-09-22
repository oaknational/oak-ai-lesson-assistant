const CONNECTIVITY_CODES = new Set(["P6008", "P5010"]);
const ENVELOPE_PREFIXES: Record<string, string> = {
  P5000: "This request could not be understood by the server: ",
  P5006: "Unknown server error: ",
};
const UNREACHABLE_ENGINE = "Query Engine instance was unreachable: 522";

/** P6008 is an upstream connection failure; P5010 is a fetch to the service failing. */
export function getAccelerateConnectivityCode(
  error: unknown,
): string | undefined {
  const seen = new Set<object>();
  while (typeof error === "object" && error !== null && !seen.has(error)) {
    seen.add(error);
    const code = "code" in error ? error.code : undefined;
    if (typeof code === "string" && CONNECTIVITY_CODES.has(code)) {
      return code;
    }

    // Prisma 6 wraps these Accelerate responses as P5000 or P5006.
    // Only unwrap the known envelope; unrelated bad requests retain their grouping.
    const prefix =
      typeof code === "string" ? ENVELOPE_PREFIXES[code] : undefined;
    if (prefix && "message" in error && typeof error.message === "string") {
      const start = error.message.indexOf(prefix);
      if (start !== -1) {
        const json = error.message
          .slice(start + prefix.length)
          .replace(/ \(The request id was: [^)]+\)$/, "");
        try {
          const payload: unknown = JSON.parse(json);
          if (
            typeof payload === "object" &&
            payload !== null &&
            "type" in payload &&
            payload.type === "UnknownJsonError" &&
            "body" in payload &&
            typeof payload.body === "object" &&
            payload.body !== null &&
            "code" in payload.body &&
            typeof payload.body.code === "string"
          ) {
            if (code === "P5000" && CONNECTIVITY_CODES.has(payload.body.code)) {
              return payload.body.code;
            }
            if (
              code === "P5006" &&
              payload.body.code === "P6000" &&
              "message" in payload.body &&
              payload.body.message === UNREACHABLE_ENGINE
            ) {
              return "P6000";
            }
          }
        } catch {
          // Malformed or unrelated messages should still be sent to Sentry unchanged.
        }
      }
    }
    error = "cause" in error ? error.cause : undefined;
  }
  return undefined;
}

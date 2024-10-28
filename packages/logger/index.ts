import debug from "debug";

import browserLogger from "./browser";
import type { StructuredLogger } from "./structuredLogger";
import structuredLogger from "./structuredLogger";

if (typeof window !== "undefined") {
  if (!process.env.NEXT_PUBLIC_DEBUG) {
    throw new Error("NEXT_PUBLIC_DEBUG is not set");
  }
  debug.enable(process.env.NEXT_PUBLIC_DEBUG);
}

const debugBase = debug("ai");
// By default debug logs to stderr, we want to use stdout
debugBase.log = console.log.bind(console);

type ChildKey =
  | "admin"
  | "aila"
  | "aila:analytics"
  | "aila:categorisation"
  | "aila:errors"
  | "aila:lesson"
  | "aila:llm"
  | "aila:moderation"
  | "aila:moderation:response"
  | "aila:persistence"
  | "aila:prompt"
  | "aila:protocol"
  | "aila:stream"
  | "aila:rag"
  | "aila:testing"
  | "analytics"
  | "app"
  | "auth"
  | "chat"
  | "cloudinary"
  | "consent"
  | "db"
  | "demo"
  | "exports"
  | "feature-flags"
  | "feedback"
  | "fixtures"
  | "generation"
  | "ingest"
  | "inngest"
  | "judgements"
  | "lessons"
  | "middleware:auth"
  | "moderation"
  | "prompts"
  | "qd"
  | "rag"
  | "rate-limiting"
  | "snippets"
  | "testing"
  | "tracing"
  | "transcripts"
  | "trpc"
  | "ui";

const errorLogger =
  typeof window === "undefined"
    ? structuredLogger.error.bind(structuredLogger)
    : browserLogger.error.bind(browserLogger);

/**
 * The AI logger uses namespaces so that we can selectively toggle noisy logs.
 * Logs are selected with the DEBUG environment variable.
 * Error logs are always shown.
 *
 * @example Include all logs except prisma
 * DEBUG=ai:*,-ai:db
 *
 * @example Usage in a module
 * import { aiLogger } from "@ai-jsx/logger";
 *
 * const log = aiLogger("db");
 * log.info("Hello world");
 */
export function aiLogger(childKey: ChildKey) {
  const debugLogger = debugBase.extend(childKey);

  return {
    info: debugLogger,
    warn: debugLogger,
    error: errorLogger.bind(structuredLogger),
  };
}

export { structuredLogger };
export type { StructuredLogger };

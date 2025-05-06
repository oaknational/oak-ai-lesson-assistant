import debug from "debug";
import invariant from "tiny-invariant";

import browserLogger from "./browser";
import type { StructuredLogger } from "./structuredLogger";
import structuredLogger from "./structuredLogger";

if (typeof window !== "undefined") {
  invariant(process.env.NEXT_PUBLIC_DEBUG, "NEXT_PUBLIC_DEBUG is not set");
  debug.enable(process.env.NEXT_PUBLIC_DEBUG);
}

const debugBase = debug("ai");
// By default debug logs to stderr, we want to use stdout
debugBase.log = console.log.bind(console);

export type LoggerKey =
  | "admin"
  | "additional-materials"
  | "aila"
  | "aila:agents"
  | "aila:analytics"
  | "aila:categorisation"
  | "aila:chat"
  | "aila:errors"
  | "aila:experimental-patches"
  | "aila:lesson"
  | "aila:llm"
  | "aila:moderation"
  | "aila:moderation:response"
  | "aila:persistence"
  | "aila:prompt"
  | "aila:protocol"
  | "aila:quiz"
  | "aila:rag"
  | "aila:stream"
  | "aila:testing"
  | "aila:threat"
  | "analytics"
  | "analytics:lesson:store"
  | "app"
  | "auth"
  | "chat"
  | "chat:store"
  | "cloudinary"
  | "consent"
  | "core"
  | "cron"
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
  | "lessons:scrolling"
  | "lessons:store"
  | "middleware:auth"
  | "moderation"
  | "moderation:store"
  | "prompts"
  | "qd"
  | "quiz"
  | "rag"
  | "rate-limiting"
  | "scrolling"
  | "snippets"
  | "testing"
  | "tracing"
  | "transcripts"
  | "trpc"
  | "ui"
  | "ui:performance"
  | "webhooks";

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
export function aiLogger(childKey: LoggerKey) {
  const debugLogger = debugBase.extend(childKey);

  const tableLogger = (tabularData: unknown[], columns?: string[]) => {
    if (typeof console !== "undefined" && console.table) {
      console.table(tabularData, columns);
    }
  };
  return {
    info: debugLogger,
    warn: debugLogger,
    error: console.error,
    table: tableLogger,
  };
}

export { structuredLogger };
export type { StructuredLogger };

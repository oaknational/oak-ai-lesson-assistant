import debug from "debug";

import structuredLogger, { StructuredLogger } from "./structuredLogger";

const debugBase = debug("ai");
// logger.log = structuredLogger.info.bind(structuredLogger);

type ChildKey =
  | "admin"
  | "admin"
  | "aila"
  | "aila:analytics"
  | "aila:errors"
  | "aila:llm"
  | "aila:moderation"
  | "aila:persistence"
  | "aila:prompt"
  | "aila:protocol"
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
  | "feedback"
  | "fixtures"
  | "generation"
  | "ingest"
  | "inngest"
  | "judgements"
  | "lessons"
  | "middleware:auth"
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

export function aiLogger(childKey: ChildKey) {
  return {
    info: debugBase.extend(childKey),
    error: structuredLogger.error,
  };
}

export { structuredLogger };
export type { StructuredLogger };

import debug from "debug";

const baseLogger = debug("ai");

type ChildKey =
  // | "api"
  // | "db"
  // | "errors"
  // | "exports"
  // | "kv"
  // | "moderation"
  // | "prompts"
  // | "sentry"
  // | "tracing"
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
  | "app"
  | "analytics"
  | "auth"
  | "admin"
  | "chat"
  | "consent"
  | "cloudinary"
  | "demo"
  | "exports"
  | "ingest"
  | "feedback"
  | "fixtures"
  | "generation"
  | "inngest"
  | "judgements"
  | "qd"
  | "rag"
  | "rate-limiting"
  | "testing";

export function aiLogger(childKey: ChildKey) {
  return baseLogger.extend(childKey);
}

export { default as legacyLogger } from "./legacyLogger";
export type { Logger as LegacyLogger } from "./legacyLogger";

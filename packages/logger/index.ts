import debug from "debug";

const baseLogger = debug("ai");

type ChildKey =
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
  | "admin"
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
  | "qd"
  | "rag"
  | "rate-limiting"
  | "testing"
  | "ui";

export function aiLogger(childKey: ChildKey) {
  return baseLogger.extend(childKey);
}

export { default as legacyLogger } from "./legacyLogger";
export type { Logger as LegacyLogger } from "./legacyLogger";

import type { StructuredLogger } from "@oakai/logger";

export type IngestLogger = {
  info: (...args: unknown[]) => void;
  error: StructuredLogger["error"];
};

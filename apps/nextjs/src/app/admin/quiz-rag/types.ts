/**
 * Shared types for Quiz RAG Debug feature.
 * Consolidates types used across multiple files.
 */
import type { ReportNode } from "@oakai/aila/src/core/quiz/instrumentation";

/**
 * SSE event from the streaming endpoint.
 * Used by both the API route and the client hook.
 */
export interface SSEEvent {
  type: "report" | "complete" | "error";
  data: ReportNode | { message: string };
  timestamp: number;
}

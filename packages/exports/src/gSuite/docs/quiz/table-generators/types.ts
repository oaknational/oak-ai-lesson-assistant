/**
 * Type definitions for quiz table generation
 */
import type { docs_v1 } from "@googleapis/docs";

/**
 * Base interface for all quiz elements
 */
export interface QuizElement {
  type: "text" | "table" | "spacer";
  requests: docs_v1.Schema$Request[];
}

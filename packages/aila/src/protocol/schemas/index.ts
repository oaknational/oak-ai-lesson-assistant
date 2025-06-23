/**
 * Protocol schemas index
 *
 * This module provides all protocol-related schemas organized by functionality:
 * - Quiz schemas (V1, V2, Raw Oak)
 * - Other schemas can be added here as they are extracted
 */

// Quiz schemas (all versions)
export * from "./quiz";
export * from "./quiz/rawQuiz";

// Re-export common types for backward compatibility
export type {
  QuizV1Question,
  QuizV2Question,
  QuizV1,
  QuizV2,
  QuizPath,
  QuizOperationType,
} from "./quiz";

export type { RawQuiz } from "./quiz/rawQuiz";

/**
 * Protocol schemas index
 *
 * This module provides all protocol-related schemas organized by functionality:
 * - Quiz schemas (V1, V2, Raw Oak)
 */

// Quiz schemas (all versions and conversion logic)
export * from "./quiz";
export * from "./quiz/conversion/quizV1ToV2";

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

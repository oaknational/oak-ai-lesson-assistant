/**
 * Quiz schema exports - both V1 (legacy) and V2 (discriminated union)
 *
 * This module provides all quiz-related schemas:
 * - V1: Multiple choice only (legacy, used by LLM)
 * - V2: Discriminated union for all quiz types (modern, used by frontend/export)
 */
import { z } from "zod";

// V1 exports (legacy)
export * from "./quizV1";

// V2 exports (modern)
export * from "./quizV2";

// Conversion utilities
export * from "./conversion/quizV1ToV2";
export * from "./conversion/rawQuizIngest";

// Common type for paths
export const quizPathSchema = z.union([
  z.literal("/starterQuiz"),
  z.literal("/exitQuiz"),
]);

export type QuizPath = z.infer<typeof quizPathSchema>;

export const quizOperationTypeSchema = z.union([
  z.literal("add"),
  z.literal("replace"),
]);

export type QuizOperationType = z.infer<typeof quizOperationTypeSchema>;

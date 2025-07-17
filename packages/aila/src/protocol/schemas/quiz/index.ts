/**
 * Quiz schema exports - both V1 (legacy) and V2 (discriminated union)
 *
 * This module provides all quiz-related schemas:
 * - V1: Multiple choice only (legacy, being phased out)
 * - V2: Discriminated union for all quiz types (modern)
 * - V2 LLM-specific: Multiple choice only subset of V2 (for LLM generation)
 */
import { z } from "zod";

// V1 exports (legacy)
export * from "./quizV1";

// V2 exports (modern)
export * from "./quizV2";

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

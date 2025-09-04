/**
 * Quiz schema exports - V1 (legacy) and V2 (discriminated union)
 *
 * This module provides all quiz-related schemas plus Latest aliases for future-proofing:
 * - V1: Multiple choice only (legacy, being phased out)
 * - V2: Discriminated union for all quiz types (current)
 * - Latest: Aliases pointing to current version (V2) - update these when V3 releases
 */
import { z } from "zod";

// Import V2 exports for aliases
import type { QuizV2, QuizV2Optional, QuizV2Question } from "./quizV2";
import {
  QuizV2MultipleChoiceOnlySchema,
  QuizV2MultipleChoiceOnlySchemaWithoutLength,
  QuizV2MultipleChoiceOnlyStrictMax6Schema,
  QuizV2OptionalSchema,
  QuizV2Schema,
  QuizV2SchemaWithoutLength,
} from "./quizV2";

// V1 exports (legacy)
export * from "./quizV1";

// V2 exports (modern)
export * from "./quizV2";

// Latest version aliases - update these when releasing new versions
export type LatestQuiz = QuizV2;
export type LatestQuizQuestion = QuizV2Question;
export type LatestQuizOptional = QuizV2Optional;
export const LatestQuizSchema = QuizV2Schema;
export const LatestQuizOptionalSchema = QuizV2OptionalSchema;
export const LatestQuizSchemaWithoutLength = QuizV2SchemaWithoutLength;
export const LatestQuizMultipleChoiceOnlySchema =
  QuizV2MultipleChoiceOnlySchema;
export const LatestQuizMultipleChoiceOnlySchemaWithoutLength =
  QuizV2MultipleChoiceOnlySchemaWithoutLength;
export const LatestQuizMultipleChoiceOnlyStrictMax6Schema =
  QuizV2MultipleChoiceOnlyStrictMax6Schema;

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

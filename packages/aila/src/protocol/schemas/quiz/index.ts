/**
 * Quiz schema exports - V1 (legacy), V2 (discriminated union), and V3 (imageMetadata)
 *
 * This module provides all quiz-related schemas plus Latest aliases for future-proofing:
 * - V1: Multiple choice only (legacy, being phased out)
 * - V2: Discriminated union for all quiz types (modern)
 * - V3: V2 + imageMetadata with dimensions (latest)
 * - Latest: Aliases pointing to current version (V3) - update these when V4 releases
 */
import { z } from "zod";

// Import V3 exports for aliases
import type { QuizV3, QuizV3Optional, QuizV3Question } from "./quizV3";
import {
  QuizV3MultipleChoiceOnlySchema,
  QuizV3MultipleChoiceOnlySchemaWithoutLength,
  QuizV3MultipleChoiceOnlyStrictMax6Schema,
  QuizV3OptionalSchema,
  QuizV3Schema,
  QuizV3SchemaWithoutLength,
} from "./quizV3";

// V1 exports (legacy)
export * from "./quizV1";

// V2 exports (modern)
export * from "./quizV2";

// V3 exports (latest)
export * from "./quizV3";

// Latest version aliases - update these when releasing new versions
export type LatestQuiz = QuizV3;
export type LatestQuizQuestion = QuizV3Question;
export type LatestQuizOptional = QuizV3Optional;
export const LatestQuizSchema = QuizV3Schema;
export const LatestQuizOptionalSchema = QuizV3OptionalSchema;
export const LatestQuizSchemaWithoutLength = QuizV3SchemaWithoutLength;
export const LatestQuizMultipleChoiceOnlySchema =
  QuizV3MultipleChoiceOnlySchema;
export const LatestQuizMultipleChoiceOnlySchemaWithoutLength =
  QuizV3MultipleChoiceOnlySchemaWithoutLength;
export const LatestQuizMultipleChoiceOnlyStrictMax6Schema =
  QuizV3MultipleChoiceOnlyStrictMax6Schema;

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

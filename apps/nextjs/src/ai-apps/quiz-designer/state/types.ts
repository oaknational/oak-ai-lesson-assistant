import { rateLimitInfoSchema } from "@oakai/api/src/types";
import {
  generationPartPlaceholderSchema,
  generationPartSchema,
} from "@oakai/core/src/types";

import { z } from "zod";

export enum QuizQuestionType {
  MultipleChoice = "MultipleChoice",
  MultipleChoiceWithMultipleAnswers = "MultipleChoiceWithMultipleAnswers",
}

/**
 * QuizApp / quizAppSchema:            The simplest way a quiz is represented
 * QuizAppState / quizAppStateSchema:  The representation of a quiz within our app,
 *                                     including field-level metadata
 * Quiz*State / quiz*StateSchema:      Any schema or type suffixed with State or StateSchema
 *                                     has additional metadata
 */

/**
 * Base schemas
 */

export type QuizAppDistractor = string;
export type QuizAppAnswer = string;

export const quizAppQuestionSchema = z.object({
  question: z.string(),
  questionType: z.nativeEnum(QuizQuestionType).nullish(),
  numberOfAnswers: z.number().nullish(),
  answers: z.array(z.string()),
  distractors: z.array(z.string()),
});

export type QuizAppQuestion = z.infer<typeof quizAppQuestionSchema>;

/**
 * State schemas
 */

export const quizAppQuestionStateSchema = z.object({
  question: generationPartSchema(z.string()),
  questionType: z.nativeEnum(QuizQuestionType),
  numberOfAnswers: z.number(),
  answers: z.array(generationPartSchema(z.string())),
  distractors: z.array(generationPartSchema(z.string())),
});

export type QuizAppStateQuestion = z.infer<typeof quizAppQuestionStateSchema>;

// Same as above, but with placeholder parts
export const quizAppPlaceholderQuestionStateSchema = z.object({
  question: generationPartPlaceholderSchema(z.string()),
  questionType: z.nativeEnum(QuizQuestionType),
  numberOfAnswers: z.number(),
  answers: z.array(generationPartPlaceholderSchema(z.string())),
  distractors: z.array(generationPartPlaceholderSchema(z.string())),
});

export enum QuizAppStatus {
  Initial = "Initial",
  EditingSubjectAndKS = "EditingSubjectAndKS",
  ResettingQuiz = "ResettingQuiz",
  EditingQuestions = "EditingQuestions",
  NonRecoverableError = "NonRecoverableError",
}

export const quizAppStateSchema = z.object({
  status: z.nativeEnum(QuizAppStatus),
  sessionId: z.string().nullable(),
  keyStage: z.string(),
  subject: z.string(),
  topic: z.string().optional(),
  questions: z.array(quizAppQuestionStateSchema),
  rateLimit: rateLimitInfoSchema.nullable(),
});

export type QuizAppState = z.infer<typeof quizAppStateSchema>;

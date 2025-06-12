import { z } from "zod";

export const MultipleChoiceQuestionSchema = z.object({
  questionType: z.literal("multiple-choice"),
  question: z.string(),
  answers: z.array(
    z.object({
      text: z.string(),
      isCorrect: z.boolean(),
    }),
  ),
});

export const MatchQuestionSchema = z.object({
  questionType: z.literal("match"),
  question: z.string(),
  answers: z.array(z.tuple([z.string(), z.string()])),
});

export const OrderQuestionSchema = z.object({
  questionType: z.literal("order"),
  question: z.string(),
  answers: z.array(
    z.object({
      text: z.string(),
      correctPosition: z.number(),
    }),
  ),
});

export const ShortAnswerQuestionSchema = z.object({
  questionType: z.literal("short-answer"),
  question: z.string(),
  answers: z.array(z.string()),
});

export const QuizQuestionSchema = z.discriminatedUnion("questionType", [
  MultipleChoiceQuestionSchema,
  MatchQuestionSchema,
  OrderQuestionSchema,
  ShortAnswerQuestionSchema,
]);

/**
 * Versioned lesson plan schema
 */
export const VersionedQuizSchema_1 = z.object({
  version: z.literal("1"),
  questions: z.array(QuizQuestionSchema),
});

export type MultipleChoiceQuestion = z.infer<
  typeof MultipleChoiceQuestionSchema
>;
export type MatchQuestion = z.infer<typeof MatchQuestionSchema>;
export type OrderQuestion = z.infer<typeof OrderQuestionSchema>;
export type ShortAnswerQuestion = z.infer<typeof ShortAnswerQuestionSchema>;
export type VersionedQuiz_1 = z.infer<typeof VersionedQuizSchema_1>;

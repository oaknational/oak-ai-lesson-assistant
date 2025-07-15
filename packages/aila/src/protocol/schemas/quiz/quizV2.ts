import { z } from "zod";

// ********** QUIZ V2 (discriminated union for multiple quiz types) **********

export const QUIZ_V2_DESCRIPTIONS = {
  question: "The question as markdown text",
  questionType: "The type of quiz question",
  answers: "The answers specific to this question type",
  hint: "Optional hint to help students",
} as const;

// Base question schema with common fields
export const QuizV2QuestionBaseSchema = z.object({
  question: z.string().describe(QUIZ_V2_DESCRIPTIONS.question),
  hint: z.string().optional().describe(QUIZ_V2_DESCRIPTIONS.hint),
});

// Multiple choice question
export const QuizV2QuestionMultipleChoiceSchema =
  QuizV2QuestionBaseSchema.extend({
    questionType: z.literal("multiple-choice"),
    answers: z.array(z.string()).min(1).describe("Correct answers as markdown"),
    distractors: z
      .array(z.string())
      .min(2)
      .describe("Incorrect answer options as markdown"),
  });

// Short answer question
export const QuizV2QuestionShortAnswerSchema = QuizV2QuestionBaseSchema.extend({
  questionType: z.literal("short-answer"),
  answers: z
    .array(z.string())
    .min(1)
    .describe("Acceptable answers as markdown"),
});

// Match question
export const QuizV2QuestionMatchSchema = QuizV2QuestionBaseSchema.extend({
  questionType: z.literal("match"),
  pairs: z
    .array(
      z.object({
        left: z.string().describe("Left side item to match as markdown"),
        right: z.string().describe("Corresponding right side item as markdown"),
      }),
    )
    .describe("Pairs of items to match"),
});

// Order question
export const QuizV2QuestionOrderSchema = QuizV2QuestionBaseSchema.extend({
  questionType: z.literal("order"),
  items: z
    .array(z.string())
    .describe("Items to be put in correct order as markdown"),
});

// Discriminated union of all question types
export const QuizV2QuestionSchema = z.discriminatedUnion("questionType", [
  QuizV2QuestionMultipleChoiceSchema,
  QuizV2QuestionShortAnswerSchema,
  QuizV2QuestionMatchSchema,
  QuizV2QuestionOrderSchema,
]);

// Quiz V2 container with version field
export const QuizV2Schema = z.object({
  version: z.literal("v2").describe("Schema version identifier"),
  questions: z.array(QuizV2QuestionSchema).describe("Array of quiz questions"),
});

export const QuizV2OptionalSchema = QuizV2Schema.optional();

export type QuizV2Question = z.infer<typeof QuizV2QuestionSchema>;
export type QuizV2 = z.infer<typeof QuizV2Schema>;
export type QuizV2Optional = z.infer<typeof QuizV2OptionalSchema>;

// Individual question type exports for convenience
export type QuizV2QuestionMultipleChoice = z.infer<
  typeof QuizV2QuestionMultipleChoiceSchema
>;
export type QuizV2QuestionShortAnswer = z.infer<
  typeof QuizV2QuestionShortAnswerSchema
>;
export type QuizV2QuestionMatch = z.infer<typeof QuizV2QuestionMatchSchema>;
export type QuizV2QuestionOrder = z.infer<typeof QuizV2QuestionOrderSchema>;

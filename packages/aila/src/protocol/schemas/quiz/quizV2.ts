import { z } from "zod";

// ********** QUIZ V2 (discriminated union for multiple quiz types) **********

export const QUIZ_V2_DESCRIPTIONS = {
  questionStem: "The question stem containing text and/or images",
  questionType: "The type of quiz question",
  answers: "The answers specific to this question type",
  feedback: "Feedback to show after the question is answered",
  hint: "Optional hint to help students",
} as const;

// Base question schema with common fields
export const QuizV2QuestionBaseSchema = z.object({
  questionStem: z.string().describe(QUIZ_V2_DESCRIPTIONS.questionStem),
  feedback: z.string().optional().describe(QUIZ_V2_DESCRIPTIONS.feedback),
  hint: z.string().optional().describe(QUIZ_V2_DESCRIPTIONS.hint),
});

// Multiple choice question
export const QuizV2QuestionMultipleChoiceSchema =
  QuizV2QuestionBaseSchema.extend({
    questionType: z.literal("multiple-choice"),
    answers: z.array(z.string()).describe("Correct answers"),
    distractors: z.array(z.string()).describe("Incorrect answer options"),
  });

// Short answer question
export const QuizV2QuestionShortAnswerSchema = QuizV2QuestionBaseSchema.extend({
  questionType: z.literal("short-answer"),
  answers: z.array(z.string()).describe("Acceptable answers"),
});

// Match question
export const QuizV2QuestionMatchSchema = QuizV2QuestionBaseSchema.extend({
  questionType: z.literal("match"),
  pairs: z
    .array(
      z.object({
        left: z.string().describe("Left side item to match"),
        right: z.string().describe("Corresponding right side item"),
      }),
    )
    .describe("Pairs of items to match"),
});

// Order question
export const QuizV2QuestionOrderSchema = QuizV2QuestionBaseSchema.extend({
  questionType: z.literal("order"),
  items: z.array(z.string()).describe("Items to be put in correct order"),
});

// Explanatory text question
export const QuizV2QuestionExplanatoryTextSchema =
  QuizV2QuestionBaseSchema.extend({
    questionType: z.literal("explanatory-text"),
    content: z.string().describe("Explanatory text content"),
  });

// Discriminated union of all question types
export const QuizV2QuestionSchema = z.discriminatedUnion("questionType", [
  QuizV2QuestionMultipleChoiceSchema,
  QuizV2QuestionShortAnswerSchema,
  QuizV2QuestionMatchSchema,
  QuizV2QuestionOrderSchema,
  QuizV2QuestionExplanatoryTextSchema,
]);

export const QuizV2Schema = z.array(QuizV2QuestionSchema);
export const QuizV2SchemaWithoutLength = z.array(QuizV2QuestionSchema);
export const QuizV2OptionalSchema = z.array(QuizV2QuestionSchema).optional();

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
export type QuizV2QuestionExplanatoryText = z.infer<
  typeof QuizV2QuestionExplanatoryTextSchema
>;

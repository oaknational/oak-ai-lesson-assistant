import { z } from "zod";

// ********** QUIZ V2 (discriminated union for multiple quiz types) **********

// Rich content support for text and images
export const QuizV2ImageObjectSchema = z.object({
  url: z.string().url().describe("Image URL (preferably secure_url)"),
  width: z.number().optional().describe("Image width in pixels"),
  height: z.number().optional().describe("Image height in pixels"),
  attribution: z.string().optional().describe("Image attribution text"),
  // NOTE: usageRestriction omitted - if restrictions existed, content likely wouldn't reach this stage from recommender
});

export const QuizV2TextItemSchema = z.object({
  type: z.literal("text"),
  text: z.string().describe("Text content"),
});

export const QuizV2ImageItemSchema = z.object({
  type: z.literal("image"),
  image: QuizV2ImageObjectSchema.describe("Image data"),
});

export const QuizV2ContentItemSchema = z.discriminatedUnion("type", [
  QuizV2TextItemSchema,
  QuizV2ImageItemSchema,
]);

export const QuizV2ContentArraySchema = z
  .array(QuizV2ContentItemSchema)
  .describe("Array of text and image content items");

export type QuizV2ImageObject = z.infer<typeof QuizV2ImageObjectSchema>;
export type QuizV2TextItem = z.infer<typeof QuizV2TextItemSchema>;
export type QuizV2ImageItem = z.infer<typeof QuizV2ImageItemSchema>;
export type QuizV2ContentItem = z.infer<typeof QuizV2ContentItemSchema>;
export type QuizV2ContentArray = z.infer<typeof QuizV2ContentArraySchema>;

export const QUIZ_V2_DESCRIPTIONS = {
  questionStem: "The question stem containing text and/or images",
  questionType: "The type of quiz question",
  answers: "The answers specific to this question type",
  feedback: "Feedback to show after the question is answered",
  hint: "Optional hint to help students",
} as const;

// Base question schema with common fields
export const QuizV2QuestionBaseSchema = z.object({
  questionStem: QuizV2ContentArraySchema.describe(QUIZ_V2_DESCRIPTIONS.questionStem),
  feedback: z.string().optional().describe(QUIZ_V2_DESCRIPTIONS.feedback),
  hint: z.string().optional().describe(QUIZ_V2_DESCRIPTIONS.hint),
});

// Multiple choice question
export const QuizV2QuestionMultipleChoiceSchema =
  QuizV2QuestionBaseSchema.extend({
    questionType: z.literal("multiple-choice"),
    answers: z.array(QuizV2ContentArraySchema).describe("Correct answers"),
    distractors: z.array(QuizV2ContentArraySchema).describe("Incorrect answer options"),
  });

// Short answer question
export const QuizV2QuestionShortAnswerSchema = QuizV2QuestionBaseSchema.extend({
  questionType: z.literal("short-answer"),
  answers: z.array(QuizV2ContentArraySchema).describe("Acceptable answers"),
});

// Match question
export const QuizV2QuestionMatchSchema = QuizV2QuestionBaseSchema.extend({
  questionType: z.literal("match"),
  pairs: z
    .array(
      z.object({
        left: QuizV2ContentArraySchema.describe("Left side item to match"),
        right: QuizV2ContentArraySchema.describe("Corresponding right side item"),
      }),
    )
    .describe("Pairs of items to match"),
});

// Order question
export const QuizV2QuestionOrderSchema = QuizV2QuestionBaseSchema.extend({
  questionType: z.literal("order"),
  items: z.array(QuizV2ContentArraySchema).describe("Items to be put in correct order"),
});

// Explanatory text question
export const QuizV2QuestionExplanatoryTextSchema =
  QuizV2QuestionBaseSchema.extend({
    questionType: z.literal("explanatory-text"),
    content: QuizV2ContentArraySchema.describe("Explanatory text content"),
  });

// Discriminated union of all question types
export const QuizV2QuestionSchema = z.discriminatedUnion("questionType", [
  QuizV2QuestionMultipleChoiceSchema,
  QuizV2QuestionShortAnswerSchema,
  QuizV2QuestionMatchSchema,
  QuizV2QuestionOrderSchema,
  QuizV2QuestionExplanatoryTextSchema,
]);

// Quiz V2 container with version field
export const QuizV2Schema = z.object({
  version: z.literal("v2").describe("Schema version identifier"),
  questions: z.array(QuizV2QuestionSchema).describe("Array of quiz questions"),
});

export const QuizV2SchemaWithoutLength = QuizV2Schema;
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
export type QuizV2QuestionExplanatoryText = z.infer<
  typeof QuizV2QuestionExplanatoryTextSchema
>;

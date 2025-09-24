import { z } from "zod";

import { minMaxText } from "../../schemaHelpers";

// ********** QUIZ V3 (imageMetadata instead of imageAttributions) **********

export const QUIZ_V3_DESCRIPTIONS = {
  question: "The question as markdown text",
  questionType: "The type of quiz question",
  answers: "The answers specific to this question type",
  hint: "Optional hint to help students",
  imageMetadata:
    "Image metadata including attribution and dimensions. DO NOT hallucinate - only use existing data from source.",
} as const;

// Stores image metadata including attribution and dimensions.
// V3 replaces imageAttributions with imageMetadata to include width/height for Google Docs API.
export const ImageMetadataSchema = z.object({
  imageUrl: z.string().describe("The URL of the image"),
  attribution: z.string().nullable().describe("Attribution text for the image"),
  width: z.number().describe("Width of the image in pixels"),
  height: z.number().describe("Height of the image in pixels"),
});

// Base question schema with common fields
export const QuizV3QuestionBaseSchema = z.object({
  question: z.string().describe(QUIZ_V3_DESCRIPTIONS.question),
  hint: z.string().nullable().describe(QUIZ_V3_DESCRIPTIONS.hint),
});

// Multiple choice question
export const QuizV3QuestionMultipleChoiceSchema =
  QuizV3QuestionBaseSchema.extend({
    questionType: z.literal("multiple-choice"),
    answers: z.array(z.string()).describe("Correct answers as markdown"),
    distractors: z
      .array(z.string())
      .describe("Incorrect answer options as markdown"),
  });

// Short answer question
export const QuizV3QuestionShortAnswerSchema = QuizV3QuestionBaseSchema.extend({
  questionType: z.literal("short-answer"),
  answers: z.array(z.string()).describe("Acceptable answers as markdown"),
});

// Match question
export const QuizV3QuestionMatchSchema = QuizV3QuestionBaseSchema.extend({
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
export const QuizV3QuestionOrderSchema = QuizV3QuestionBaseSchema.extend({
  questionType: z.literal("order"),
  items: z
    .array(z.string())
    .describe("Items to be put in correct order as markdown"),
});

// Discriminated union of all question types
export const QuizV3QuestionSchema = z.discriminatedUnion("questionType", [
  QuizV3QuestionMultipleChoiceSchema,
  QuizV3QuestionShortAnswerSchema,
  QuizV3QuestionMatchSchema,
  QuizV3QuestionOrderSchema,
]);

// Quiz V3 container with version field
export const QuizV3Schema = z.object({
  version: z.literal("v3").describe("Schema version identifier"),
  questions: z.array(QuizV3QuestionSchema).describe("Array of quiz questions"),
  imageMetadata: z
    .array(ImageMetadataSchema)
    .describe(QUIZ_V3_DESCRIPTIONS.imageMetadata),
});

export const QuizV3SchemaWithoutLength = QuizV3Schema;
export const QuizV3OptionalSchema = QuizV3Schema.optional();

export type ImageMetadata = z.infer<typeof ImageMetadataSchema>;
export type QuizV3Question = z.infer<typeof QuizV3QuestionSchema>;
export type QuizV3 = z.infer<typeof QuizV3Schema>;
export type QuizV3Optional = z.infer<typeof QuizV3OptionalSchema>;

// Individual question type exports for convenience
export type QuizV3QuestionMultipleChoice = z.infer<
  typeof QuizV3QuestionMultipleChoiceSchema
>;
export type QuizV3QuestionShortAnswer = z.infer<
  typeof QuizV3QuestionShortAnswerSchema
>;
export type QuizV3QuestionMatch = z.infer<typeof QuizV3QuestionMatchSchema>;
export type QuizV3QuestionOrder = z.infer<typeof QuizV3QuestionOrderSchema>;

// ********** LLM-SPECIFIC SCHEMAS (MULTIPLE CHOICE ONLY) **********

// LLM can only generate multiple choice questions, so we create specific schemas for that
export const QuizV3MultipleChoiceOnlyQuestionSchema =
  QuizV3QuestionMultipleChoiceSchema;

export const QuizV3MultipleChoiceOnlySchema = z.object({
  version: z.literal("v3").describe("Schema version identifier"),
  questions: z
    .array(QuizV3MultipleChoiceOnlyQuestionSchema)
    .describe(
      `Array of multiple choice quiz questions. ${minMaxText({ min: 1, entity: "elements" })}`,
    ),
  imageMetadata: z
    .array(ImageMetadataSchema)
    .describe(QUIZ_V3_DESCRIPTIONS.imageMetadata),
});

export const QuizV3MultipleChoiceOnlySchemaWithoutLength =
  QuizV3MultipleChoiceOnlySchema;

export const QuizV3MultipleChoiceOnlyOptionalSchema =
  QuizV3MultipleChoiceOnlySchema.optional();

export const QuizV3MultipleChoiceOnlyStrictMax6Schema =
  QuizV3MultipleChoiceOnlySchema.extend({
    questions: z.array(QuizV3MultipleChoiceOnlyQuestionSchema).min(1).max(6),
  });

// Type exports for LLM-specific schemas
export type QuizV3MultipleChoiceOnly = z.infer<
  typeof QuizV3MultipleChoiceOnlySchema
>;
export type QuizV3MultipleChoiceOnlyOptional = z.infer<
  typeof QuizV3MultipleChoiceOnlyOptionalSchema
>;

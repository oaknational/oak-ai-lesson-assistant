import { z } from "zod";

import { minMaxText } from "../../schemaHelpers";

// ********** QUIZ V2 (discriminated union for multiple quiz types) **********

export const QUIZ_V2_DESCRIPTIONS = {
  question: "The question as markdown text",
  questionType: "The type of quiz question",
  answers: "The answers specific to this question type",
  hint: "Optional hint to help students",
  imageAttributions:
    "Copyright info for images. DO NOT hallucinate - only use existing attributions from source.",
} as const;

// Stores image metadata including attribution and dimensions.
// Extended from attribution-only to include width/height for Google Docs API.
// All fields optional for backward compatibility.
export const ImageMetadataSchema = z.object({
  imageUrl: z.string().describe("The URL of the image"),
  attribution: z.string().optional().describe("Attribution text for the image"),
  width: z.number().optional().describe("Width of the image in pixels"),
  height: z.number().optional().describe("Height of the image in pixels"),
});

// Base question schema with common fields
export const QuizV2QuestionBaseSchema = z.object({
  question: z.string().describe(QUIZ_V2_DESCRIPTIONS.question),
  hint: z.string().nullable().describe(QUIZ_V2_DESCRIPTIONS.hint),
});

// Multiple choice question
export const QuizV2QuestionMultipleChoiceSchema =
  QuizV2QuestionBaseSchema.extend({
    questionType: z.literal("multiple-choice"),
    answers: z.array(z.string()).describe("Correct answers as markdown"),
    distractors: z
      .array(z.string())
      .describe("Incorrect answer options as markdown"),
  });

// Short answer question
export const QuizV2QuestionShortAnswerSchema = QuizV2QuestionBaseSchema.extend({
  questionType: z.literal("short-answer"),
  answers: z.array(z.string()).describe("Acceptable answers as markdown"),
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
  /**
   * Image metadata including attribution and dimensions.
   * Named "imageAttributions" for backward compatibility - originally stored only
   * attribution data, now extended to include width/height for Google Docs API.
   */
  imageAttributions: z
    .array(ImageMetadataSchema)
    .describe("Image metadata including attribution and dimensions"),
});

export const QuizV2SchemaWithoutLength = QuizV2Schema;
export const QuizV2OptionalSchema = QuizV2Schema.optional();

export type ImageMetadata = z.infer<typeof ImageMetadataSchema>;

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

// ********** LLM-SPECIFIC SCHEMAS (MULTIPLE CHOICE ONLY) **********

// LLM can only generate multiple choice questions, so we create specific schemas for that
export const QuizV2MultipleChoiceOnlyQuestionSchema =
  QuizV2QuestionMultipleChoiceSchema;

export const QuizV2MultipleChoiceOnlySchema = z.object({
  version: z.literal("v2").describe("Schema version identifier"),
  questions: z
    .array(QuizV2MultipleChoiceOnlyQuestionSchema)
    .describe(
      `Array of multiple choice quiz questions. ${minMaxText({ min: 1, entity: "elements" })}`,
    ),
  /**
   * Image metadata including attribution and dimensions.
   * Named "imageAttributions" for backward compatibility - originally stored only
   * attribution data, now extended to include width/height for Google Docs API.
   */
  imageAttributions: z
    .array(ImageMetadataSchema)
    .describe(QUIZ_V2_DESCRIPTIONS.imageAttributions),
});

export const QuizV2MultipleChoiceOnlySchemaWithoutLength =
  QuizV2MultipleChoiceOnlySchema;

export const QuizV2MultipleChoiceOnlyOptionalSchema =
  QuizV2MultipleChoiceOnlySchema.optional();

export const QuizV2MultipleChoiceOnlyStrictMax6Schema =
  QuizV2MultipleChoiceOnlySchema.extend({
    questions: z.array(QuizV2MultipleChoiceOnlyQuestionSchema).min(1).max(6),
  });

// Type exports for LLM-specific schemas
export type QuizV2MultipleChoiceOnly = z.infer<
  typeof QuizV2MultipleChoiceOnlySchema
>;
export type QuizV2MultipleChoiceOnlyOptional = z.infer<
  typeof QuizV2MultipleChoiceOnlyOptionalSchema
>;

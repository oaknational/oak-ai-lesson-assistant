import { z } from "zod";

// ********** QUIZ V1 (legacy with only multiple-choice) **********

export const QUIZ_V1_DESCRIPTIONS = {
  question: "The question to be asked in the quiz.",
  answers: "The correct answer. This should be an array of only one item.",
  distractors: "A set of distractors. This must be an array with two items.",
} satisfies {
  question: string;
  answers: string;
  distractors: string;
};

export const QuizV1QuestionSchemaWithoutLength = z.object({
  question: z.string().describe(QUIZ_V1_DESCRIPTIONS.question),
  answers: z.array(z.string()).describe(QUIZ_V1_DESCRIPTIONS.answers),
  distractors: z.array(z.string()).describe(QUIZ_V1_DESCRIPTIONS.distractors),
});

// TODO: MG - Double check this is allowable.
export const QuizV1QuestionSchema = QuizV1QuestionSchemaWithoutLength; //.extend({
//   answers: QuizV1QuestionSchemaWithoutLength.shape.answers.length(1),
//   distractors: QuizV1QuestionSchemaWithoutLength.shape.distractors.length(2),
// });

export const QuizV1QuestionOptionalSchema = QuizV1QuestionSchema.partial();

export type QuizV1Question = z.infer<typeof QuizV1QuestionSchema>;
export type QuizV1QuestionOptional = z.infer<
  typeof QuizV1QuestionOptionalSchema
>;

export const QuizV1Schema = z.array(QuizV1QuestionSchema);
export const QuizV1SchemaWithoutLength = z.array(
  QuizV1QuestionSchemaWithoutLength,
);
export const QuizV1SchemaStrictMax6Schema = QuizV1Schema.min(1).max(6);
export const QuizV1OptionalSchema = z.array(QuizV1QuestionOptionalSchema);

export type QuizV1 = z.infer<typeof QuizV1Schema>;
export type QuizV1Optional = z.infer<typeof QuizV1OptionalSchema>;

import { z } from "zod";

import { QuizQuestionSchema } from "../../../protocol/schema";
import type { BaseType } from "../ChoiceModels";

export const ratingAndJustificationSchema = z.object({
  chainOfThought: z
    .string()
    .describe("The chain of thought that led to the rating"),
  rating: z
    .number()
    .describe(
      "The rating for the given criteria and response taking the chain of thought into account. The rating is a float between 0 and 1.",
    ),
});

export const starterQuizQuestionSuitabilityDescriptionSchema = z.object({
  relevanceToPriorKnowledge: ratingAndJustificationSchema,
  alignmentWithKeyLearningPoints: ratingAndJustificationSchema,
  congitiveLevel: ratingAndJustificationSchema,
  clarityAndSpecificity: ratingAndJustificationSchema,
  potentialForInsight: ratingAndJustificationSchema,
  overallSuitability: z
    .boolean()
    .describe(
      "Whether the question is suitable for the lesson plan and should be included in the starter quiz",
    ),
  justification: z
    .string()
    .describe("Justification for the overall suitability rating"),
});

export const starterQuizSuitabilitySchema = z.object({
  consideration: starterQuizQuestionSuitabilityDescriptionSchema,
  overallSuitability: z
    .boolean()
    .describe(
      "Whether the starter quiz is suitable for the lesson plan and should be included in the lesson",
    ),
  justification: z
    .boolean()
    .describe("Justification for the overall suitability rating"),
});

export const testRatingSchema = z.object({
  rating: z
    .number()
    .describe(
      "The rating for the given criteria and response taking the chain of thought into account. The rating is a float between 0 and 1.",
    ),
  justification: z
    .string()
    .describe("The chain of thought that led to the rating"),
}) satisfies z.ZodType<BaseType>;

export type TestRating = z.infer<typeof testRatingSchema>;

export const quizConsiderationSchema = z.object({
  basedOnId: z
    .string()
    .describe(
      "The id of the lesson plan that this lesson plan is explicitly based on",
    )
    .optional(),
  ragLessonPlanIds: z
    .array(z.string())
    .describe(
      "The ids of the RAG lesson plans that are relevant to this lesson plan",
    ),
  mlQuizQuestions: z
    .array(QuizQuestionSchema)
    .describe("The questions in the ML quiz"),
});

export type QuizzesForConsideration = z.infer<typeof quizConsiderationSchema>;

// export const output_option

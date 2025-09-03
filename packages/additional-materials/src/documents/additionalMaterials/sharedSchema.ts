import { z } from "zod";

import { LessonPlanSchema } from "../../../../aila/src/protocol/schema";

export const lessonPlanSchemaTeachingMaterials = LessonPlanSchema.extend({
  year: z.string().optional(),
  transcript: z.string().optional(),
  hasRestrictedWorks: z.boolean().optional(),
  lessonId: z.string().optional(),
});
export type LessonPlanSchemaTeachingMaterials = z.infer<
  typeof lessonPlanSchemaTeachingMaterials
>;

export const baseContext = {
  lessonPlan: lessonPlanSchemaTeachingMaterials,
  transcript: z.string().nullish(),
  message: z.string().nullish(),
};

// Shared quiz schemas
export const quizAnswerSchema = z.object({
  text: z.string(),
  isCorrect: z.boolean(),
});

export const quizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(quizAnswerSchema).length(3),
});

export const baseQuizSchema = z.object({
  year: z.string(),
  subject: z.string(),
  title: z.string(),
  questions: z.array(quizQuestionSchema).length(10),
});

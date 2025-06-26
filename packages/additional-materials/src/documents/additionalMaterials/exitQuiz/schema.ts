import { z } from "zod";

import { LessonPlanSchema } from "../../../../../aila/src/protocol/schema";
import { refinementSchema } from "../refinement/schema";

// Quiz answer schema
export const answerSchema = z.object({
  text: z.string(),
  isCorrect: z.boolean(),
});

// Quiz question schema
export const questionSchema = z.object({
  question: z.string(),
  options: z.array(answerSchema).length(3),
});

// Quiz schema
export const exitQuizSchema = z.object({
  year: z.string(),
  subject: z.string(),
  title: z.string(),
  questions: z.array(questionSchema).length(10),
});

// Context schema for exit quiz generation
export const exitQuizContextSchema = z.object({
  lessonPlan: LessonPlanSchema,
  previousOutput: exitQuizSchema.nullish(),
  options: z.any().nullish(),
  refinement: z.array(refinementSchema).nullish(),
  message: z.string().nullish(),
});

// Export type
export type ExitQuiz = z.infer<typeof exitQuizSchema>;

export const isExitQuiz = (data: unknown): data is ExitQuiz => {
  const result = exitQuizSchema.safeParse(data);
  return result.success;
};

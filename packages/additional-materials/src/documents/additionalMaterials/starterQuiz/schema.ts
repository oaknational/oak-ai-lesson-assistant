import { z } from "zod";

import { refinementSchema } from "../refinement/schema";
import { baseContext } from "../sharedSchema";

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
export const starterQuizSchema = z.object({
  year: z.string(),
  subject: z.string(),
  title: z.string(),
  questions: z.array(questionSchema).length(10),
});

// Context schema for starter quiz generation
export const starterQuizContextSchema = z.object({
  ...baseContext,
  previousOutput: starterQuizSchema.nullish(),
  options: z.any().nullish(),
  refinement: z.array(refinementSchema).nullish(),
});

// Export type
export type StarterQuiz = z.infer<typeof starterQuizSchema>;

export const isStarterQuiz = (data: unknown): data is StarterQuiz => {
  const result = starterQuizSchema.safeParse(data);
  return result.success;
};

import { z } from "zod";

import { refinementSchema } from "../refinement/schema";
import { baseContext, baseQuizSchema } from "../sharedSchema";

// Starter quiz schema (uses shared base schema)
export const starterQuizSchema = baseQuizSchema;

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

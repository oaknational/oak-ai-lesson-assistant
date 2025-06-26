import { z } from "zod";

import { refinementSchema } from "../refinement/schema";
import { baseContext, baseQuizSchema } from "../sharedSchema";

// Exit quiz schema (uses shared base schema)
export const exitQuizSchema = baseQuizSchema;

// Context schema for exit quiz generation
export const exitQuizContextSchema = z.object({
  ...baseContext,
  previousOutput: exitQuizSchema.nullish(),
  options: z.any().nullish(),
  refinement: z.array(refinementSchema).nullish(),
});

// Export type
export type ExitQuiz = z.infer<typeof exitQuizSchema>;

export const isExitQuiz = (data: unknown): data is ExitQuiz => {
  const result = exitQuizSchema.safeParse(data);
  return result.success;
};

import { z } from "zod";

import { LessonPlanSchema } from "../../../../../aila/src/protocol/schema";
import { readingAgeRefinement } from "../glossary/schema";

export const baseContext = {
  lessonPlan: LessonPlanSchema,
  transcript: z.string().nullish(),
  message: z.string().nullish(),
};

export const comprehensionTaskSchema = z.object({
  comprehension: z.object({
    lessonTitle: z.string().min(3).max(100),
    yearGroup: z.string(),
    subject: z.string(),
    instructions: z.string(),
    text: z.string().min(20),
    questions: z.array(
      z.object({
        questionNumber: z.number(),
        questionText: z.string().min(5),
        answer: z.string(),
      }),
    ),
  }),
});

export type ComprehensionTask = z.infer<typeof comprehensionTaskSchema>;

export const isComprehensionTask = (
  data: unknown,
): data is ComprehensionTask => {
  const result = comprehensionTaskSchema.safeParse(data);
  return result.success;
};

const refinementTypes = z.enum([...readingAgeRefinement, "custom"] as const);

const refinementSchema = z.object({
  type: refinementTypes,
  payload: z.string().optional(),
});

const optionsSchema = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionCount: z.number().min(1).max(10),
});
export const comprehensionContextSchema = z.object({
  ...baseContext,
  previousOutput: comprehensionTaskSchema.nullish(),
  options: optionsSchema.nullish(),
  refinement: z.array(refinementSchema).nullish(),
});

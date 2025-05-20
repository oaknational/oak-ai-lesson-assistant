import { z } from "zod";

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

// Generic lesson plan schema for context
const genericLessonPlanSchema = z
  .object({
    title: z.string(),
    keyStage: z.string(),
    subject: z.string(),
    priorKnowledge: z.any().optional(),
    keywords: z.any().optional(),
    learningOutcome: z.any().optional(),
    misconceptions: z.any().optional(),
  })
  .passthrough();

// Context schema for exit quiz generation
export const exitQuizContextSchema = z.object({
  lessonPlan: genericLessonPlanSchema,
  previousOutput: exitQuizSchema.nullish(),
  options: z.any().nullish(),
  refinement: z.any().nullish(),
  message: z.string().nullish(),
});

// Type guard function for type checking
export function isExitQuiz(
  data: unknown,
): data is z.infer<typeof exitQuizSchema> {
  try {
    exitQuizSchema.parse(data);
    return true;
  } catch (error) {
    return false;
  }
}

// Export type
export type ExitQuiz = z.infer<typeof exitQuizSchema>;

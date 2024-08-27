import z from "zod";

export const outputSchema = z.object({
  keyLearningPoints: z.array(z.string()).optional(),
  misconceptions: z
    .array(
      z.object({
        misconception: z.string(),
        description: z.string(),
      }),
    )
    .optional(),
  keywords: z
    .array(
      z.object({
        keyword: z.string(),
        description: z.string(),
      }),
    )
    .optional(),
  starterQuiz: z
    .array(
      z.object({
        question: z.string(),
        answers: z.array(z.string()).max(1),
        distractors: z.array(z.string()),
      }),
    )
    .optional(),
  exitQuiz: z
    .array(
      z.object({
        question: z.string(),
        answers: z.array(z.string()).max(1),
        distractors: z.array(z.string()),
      }),
    )
    .optional(),
  justification: z.string().optional(),
});

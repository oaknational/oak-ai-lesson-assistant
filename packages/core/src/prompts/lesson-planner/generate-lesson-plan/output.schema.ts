import z from "zod";

export const outputSchema = z.object({
  keyLearningPoints: z.array(z.string()),
  misconceptions: z.array(
    z.object({
      misconception: z.string(),
      description: z.string(),
    }),
  ),
  keywords: z.array(
    z.object({
      keyword: z.string(),
      description: z.string(),
    }),
  ),
  starterQuiz: z.array(
    z.object({
      question: z.string(),
      answers: z.array(z.string()).max(1),
      distractors: z.array(z.string()),
    }),
  ),
  exitQuiz: z.array(
    z.object({
      question: z.string(),
      answers: z.array(z.string()).max(1),
      distractors: z.array(z.string()),
    }),
  ),
  justification: z.string(),
});

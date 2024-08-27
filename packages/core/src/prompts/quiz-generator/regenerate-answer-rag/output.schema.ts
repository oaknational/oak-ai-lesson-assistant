import z from "zod";

export const outputSchema = z.object({
  answers: z.array(z.string()),
  question: z.string(),
  distractors: z.array(z.string()),
});

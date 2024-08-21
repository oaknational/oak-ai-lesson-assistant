import z from "zod";

export const outputSchema = z.object({
  answers: z.array(z.string()),
  question: z.string(),
  regeneratedDistractors: z.array(z.string()),
});

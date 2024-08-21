import z from "zod";

export const outputSchema = z.object({
  answers: z.array(z.string()),
  question: z.string(),
  regeneratedDistractor: z.string(),
});

import z from "zod";

export const inputSchema = z.object({
  fact: z.string(),
  transcript: z.string(),
  otherQuestions: z.string(),
  subject: z.string(),
  knowledge: z.string(),
  topic: z.string(),
  ageRange: z.string(),
  numberOfDistractors: z.number(),
  numberOfCorrectAnswers: z.number(),
});

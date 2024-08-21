import { z } from "zod";

export const Question = z.object({
  order: z.number(),
  id: z.number(),
  type: z.string(),
  entry: z.string().nullable().optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  choices: z.array(z.string()),
  required: z.boolean(),
  images: z.array(z.unknown()).nullable().optional(),
  choiceImages: z.array(z.unknown()).nullable().optional(),
  answer: z.string().nullable().optional().or(z.array(z.string())),
  points: z.number().nullable().optional(),
  group: z.string().nullable().optional(),
  updatedAt: z.string(),
});

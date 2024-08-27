import { z } from "zod";

import { Question } from "./question";

export const Quiz = z.object({
  type: z.string(),
  quiz: z.object({
    id: z.number(),
    ingestId: z.string(),
    title: z.string(),
    description: z.string().nullable().optional(),
    source: z.string(),
    maxPoints: z.number().nullable().optional(),
    questions: z.array(Question),
  }),
});

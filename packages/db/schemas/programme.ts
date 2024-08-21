import { z } from "zod";

export const Programme = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  subject: z.object({
    id: z.number(),
    slug: z.string(),
    title: z.string(),
  }),
  year: z.object({
    id: z.number(),
    title: z.string(),
    slug: z.string(),
    keyStage: z.object({
      id: z.number(),
      title: z.string(),
      slug: z.string(),
    }),
  }),
});

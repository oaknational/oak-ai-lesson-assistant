import { z } from "zod";

export const LessonWithSnippets = z.object({
  lesson: z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
  }),
  snippets: z.array(
    z.object({
      sourceContent: z.string(),
      content: z.string(),
      status: z.string(),

      updatedAt: z.date(),
      keyStageSlug: z.string(),
      subjectSlug: z.string(),
    }),
  ),
});

export type LessonWithSnippets = z.infer<typeof LessonWithSnippets>;

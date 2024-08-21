import z from "zod";

export const summariseLessonSchema = {
  data: z.object({
    lessonId: z.string(),
    lessonSummaryId: z.string().optional(),
  }),
};

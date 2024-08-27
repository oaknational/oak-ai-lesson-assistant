import z from "zod";

export const embedLessonSummarySchema = {
  data: z.object({
    lessonSummaryId: z.string(),
  }),
};

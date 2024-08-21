import z from "zod";

export const processLessonPlanSchema = {
  data: z.object({
    lessonPlanId: z.string(),
  }),
};

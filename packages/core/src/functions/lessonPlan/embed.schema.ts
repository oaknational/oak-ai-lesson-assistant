import z from "zod";

export const embedLessonPlanSchema = {
  data: z.object({
    lessonPlanId: z.string(),
  }),
};

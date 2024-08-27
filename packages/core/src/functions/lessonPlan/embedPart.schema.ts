import z from "zod";

export const embedLessonPlanPartSchema = {
  data: z.object({
    lessonPlanPartId: z.string(),
  }),
};

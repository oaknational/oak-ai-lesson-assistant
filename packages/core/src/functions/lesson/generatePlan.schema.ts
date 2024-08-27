import z from "zod";

export const generatePlanForLessonSchema = {
  data: z.object({
    lessonId: z.string(),
  }),
};

import z from "zod";

export const generateLessonQuizEmbeddingsSchema = {
  data: z.object({
    lessonId: z.string(),
  }),
};

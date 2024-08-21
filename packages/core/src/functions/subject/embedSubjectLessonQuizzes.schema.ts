import z from "zod";

export const embedSubjectLessonQuizzesSchema = {
  data: z.object({
    subject: z.string(),
    keyStage: z.string(),
  }),
};

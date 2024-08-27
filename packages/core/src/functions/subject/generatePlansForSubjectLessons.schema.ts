import z from "zod";

export const generateLessonPlansForSubjectLessonsSchema = {
  data: z.object({
    subject: z.string(),
    keyStage: z.string(),
  }),
};

import z from "zod";

export const summariseSubjectLessonsSchema = {
  data: z.object({
    subject: z.string(),
    keyStage: z.string(),
  }),
};

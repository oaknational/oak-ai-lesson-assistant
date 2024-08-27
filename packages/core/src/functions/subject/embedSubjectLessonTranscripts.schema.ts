import z from "zod";

export const embedSubjectLessonTranscriptsSchema = {
  data: z.object({
    subject: z.string(),
    keyStage: z.string(),
  }),
};

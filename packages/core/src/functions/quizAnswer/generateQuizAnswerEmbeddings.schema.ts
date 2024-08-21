import z from "zod";

export const embedQuizAnswerSchema = {
  data: z.object({
    quizAnswerId: z.string(),
  }),
};

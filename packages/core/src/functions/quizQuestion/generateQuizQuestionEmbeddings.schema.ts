import z from "zod";

export const embedQuizQuestionSchema = {
  data: z.object({
    quizQuestionId: z.string(),
  }),
};

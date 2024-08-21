import z from "zod";

export const outputSchema = z
  .object({
    starterQuiz: z.array(
      z.object({
        question: z.string(),
        answers: z.array(z.string()).max(1),
        distractors: z.array(z.string()),
      }),
    ),
  })
  .or(
    z.object({
      exitQuiz: z.array(
        z.object({
          question: z.string(),
          answers: z.array(z.string()).max(1),
          distractors: z.array(z.string()),
        }),
      ),
    }),
  );

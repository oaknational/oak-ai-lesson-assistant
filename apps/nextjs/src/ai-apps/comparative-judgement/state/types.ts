import { z } from "zod";

export type OptionWithPrompt = Option & {
  prompt: {
    identifier: string;
    template: string;
  };
};
export type Option = z.infer<typeof optionSchema>;

export type AnswerAndDistractor = z.infer<typeof answerAndDistractorSchema>;

const answerSchema = z.object({
  value: z.string(),
});

const distractorSchema = z.object({
  value: z.string(),
});

const answerAndDistractorSchema = z.object({
  answers: z.array(answerSchema),
  distractors: z.array(distractorSchema),
});

export const optionSchema = z.union([
  z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    quizQuestionId: z.string().nullable(),
    answerAndDistractor: answerAndDistractorSchema,
    isOakQuestion: z.boolean().nullable(),
    promptId: z.string().nullable(),
  }),
  z.undefined(),
]);

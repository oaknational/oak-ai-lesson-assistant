import { z } from "zod";

export const quizDocsTemplateSchema = z.object({
  lesson_title: z.string(),
  quiz_type: z.string(),
  question_1: z.string().nullish(),
  question_1_answer_a: z.string().nullish(),
  question_1_answer_b: z.string().nullish(),
  question_1_answer_c: z.string().nullish(),
  question_2: z.string().nullish(),
  question_2_answer_a: z.string().nullish(),
  question_2_answer_b: z.string().nullish(),
  question_2_answer_c: z.string().nullish(),
  question_3: z.string().nullish(),
  question_3_answer_a: z.string().nullish(),
  question_3_answer_b: z.string().nullish(),
  question_3_answer_c: z.string().nullish(),
  question_4: z.string().nullish(),
  question_4_answer_a: z.string().nullish(),
  question_4_answer_b: z.string().nullish(),
  question_4_answer_c: z.string().nullish(),
  question_5: z.string().nullish(),
  question_5_answer_a: z.string().nullish(),
  question_5_answer_b: z.string().nullish(),
  question_5_answer_c: z.string().nullish(),
  question_6: z.string().nullish(),
  question_6_answer_a: z.string().nullish(),
  question_6_answer_b: z.string().nullish(),
  question_6_answer_c: z.string().nullish(),
});

export type QuizDocsTemplateData = z.infer<typeof quizDocsTemplateSchema>;

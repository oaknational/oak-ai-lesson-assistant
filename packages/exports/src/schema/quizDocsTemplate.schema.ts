import { z } from "zod";

const questionCount = 6;
const answerOptions = ["a", "b", "c"] as const;

const generateQuestionSchema = (num: number) => ({
  [`question_${num}`]: z.string().nullish(),
  ...Object.fromEntries(
    answerOptions.map((letter) => [
      `question_${num}_answer_${letter}`,
      z.string().nullish(),
    ]),
  ),
});

export const quizDocsTemplateSchema = z.object({
  lesson_title: z.string(),
  quiz_type: z.string(),
  ...Object.assign(
    {},
    ...Array.from({ length: questionCount }, (_, i) =>
      generateQuestionSchema(i + 1),
    ),
  ),
});

export type QuizDocsTemplateData = z.infer<typeof quizDocsTemplateSchema>;

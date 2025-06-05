import type { Quiz } from "./schema";
import type { StemItem, VersionedQuiz_1 } from "./versionedSchema";

export function unversionedToVersion1Quiz(quiz: Quiz): VersionedQuiz_1 {
  return {
    version: "1",
    quiz: quiz.map((question) => {
      return {
        questionType: "multiple-choice",
        questionStem: textToStem(question.question),
        answers: [
          // solve the question of random order of answers
          ...question.distractors.map((distractor) => {
            return {
              answer: textToStem(distractor),
              correct: false,
            };
          }),
          ...question.answers.map((answer) => {
            return {
              answer: textToStem(answer),
              correct: true,
            };
          }),
        ],
      };
    }),
  };
}

function textToStem(text: string): StemItem[] {
  return [
    {
      type: "text",
      text,
    },
  ];
}

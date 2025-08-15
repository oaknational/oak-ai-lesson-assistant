import {
  convertCamelCaseToSnakeCase,
  convertRawQuizToV2,
} from "../../protocol/schemas/quiz/conversion/rawQuizIngest";
import type {
  QuizV2,
  QuizV2Question,
} from "../../protocol/schemas/quiz/quizV2";
import type { RawQuiz } from "../../protocol/schemas/quiz/rawQuiz";
import type { QuizQuestionWithRawJson } from "./interfaces";

export function coerceQuizQuestionWithJson(
  quizQuestion: QuizQuestionWithRawJson,
): QuizV2 {
  const snakeCaseQuiz = convertCamelCaseToSnakeCase(quizQuestion.rawQuiz);
  return convertRawQuizToV2(snakeCaseQuiz);
}

export function coerceQuizQuestionWithJsonArray(
  quizQuestions: QuizQuestionWithRawJson[],
): QuizV2 {
  const quizV2s = quizQuestions.map((quizQuestion) =>
    coerceQuizQuestionWithJson(quizQuestion),
  );

  // Merge all QuizV2 objects into a single one
  const mergedQuestions: QuizV2Question[] = [];
  const mergedImageAttributions: Array<{
    imageUrl: string;
    attribution: string;
  }> = [];

  for (const quizV2 of quizV2s) {
    mergedQuestions.push(...quizV2.questions);
    mergedImageAttributions.push(...quizV2.imageAttributions);
  }

  return {
    version: "v2",
    questions: mergedQuestions,
    imageAttributions: mergedImageAttributions,
  };
}

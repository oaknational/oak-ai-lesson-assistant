import type { RawQuiz } from "../../protocol/rawQuizSchema";
import type { QuizQuestionWithRawJson } from "./interfaces";

export function coerceQuizQuestionWithJson(
  quizQuestion: QuizQuestionWithRawJson,
): NonNullable<RawQuiz> {
  return Array.isArray(quizQuestion.rawQuiz) ? quizQuestion.rawQuiz : [];
}

export function coerceQuizQuestionWithJsonArray(
  quizQuestions: QuizQuestionWithRawJson[],
): NonNullable<RawQuiz> {
  return quizQuestions.flatMap((quizQuestion) =>
    coerceQuizQuestionWithJson(quizQuestion),
  );
}

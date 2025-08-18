import { convertHasuraQuizToV2 } from "../../protocol/schemas/quiz/conversion/rawQuizIngest";
import type {
  QuizV2,
  QuizV2Question,
} from "../../protocol/schemas/quiz/quizV2";
import type { QuizQuestionWithRawJson } from "./interfaces";

export function coerceQuizQuestionWithJson(
  quizQuestion: QuizQuestionWithRawJson,
): QuizV2 {
  return convertHasuraQuizToV2(quizQuestion.rawQuiz);
}

export function coerceQuizQuestionWithJsonArray(
  quizQuestions: QuizQuestionWithRawJson[],
): QuizV2 {
  const quizV2s = quizQuestions.map((quizQuestion) =>
    coerceQuizQuestionWithJson(quizQuestion),
  );

  // Merge all QuizV2 objects into a single one
  const mergedQuestions: QuizV2Question[] = [];
  const mergedImageAttributions: QuizV2["imageAttributions"] = [];

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

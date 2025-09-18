import type {
  LatestQuiz,
  LatestQuizQuestion,
} from "../../protocol/schemas/quiz";
import { convertHasuraQuizToV2 } from "../../protocol/schemas/quiz/conversion/rawQuizIngest";
import type { QuizQuestionWithRawJson } from "./interfaces";

export function coerceQuizQuestionWithJson(
  quizQuestion: QuizQuestionWithRawJson,
): LatestQuiz {
  return convertHasuraQuizToV2(quizQuestion.rawQuiz);
}

export function coerceQuizQuestionWithJsonArray(
  quizQuestions: QuizQuestionWithRawJson[],
): LatestQuiz {
  const quizzes = quizQuestions.map((quizQuestion) =>
    coerceQuizQuestionWithJson(quizQuestion),
  );

  // Merge all quiz objects into a single one
  const mergedQuestions: LatestQuizQuestion[] = [];
  const mergedImageAttributions: LatestQuiz["imageAttributions"] = [];

  for (const quiz of quizzes) {
    mergedQuestions.push(...quiz.questions);
    mergedImageAttributions.push(...quiz.imageAttributions);
  }

  return {
    version: "v2",
    questions: mergedQuestions,
    imageAttributions: mergedImageAttributions,
  };
}

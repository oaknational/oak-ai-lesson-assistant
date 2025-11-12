import type {
  LatestQuiz,
  LatestQuizQuestion,
} from "../../protocol/schemas/quiz";
import { convertHasuraQuizToV3 } from "../../protocol/schemas/quiz/conversion/rawQuizIngest";
import type { QuizQuestionWithSourceData } from "./interfaces";

export function coerceQuizQuestionWithJson(
  quizQuestion: QuizQuestionWithSourceData,
): LatestQuiz {
  return convertHasuraQuizToV3([quizQuestion.source]);
}

export function coerceQuizQuestionWithJsonArray(
  quizQuestions: QuizQuestionWithSourceData[],
): LatestQuiz {
  const quizzes = quizQuestions.map((quizQuestion) =>
    coerceQuizQuestionWithJson(quizQuestion),
  );

  // Merge all quiz objects into a single one
  const mergedQuestions: LatestQuizQuestion[] = [];
  const mergedImageMetadata: LatestQuiz["imageMetadata"] = [];

  for (const quiz of quizzes) {
    mergedQuestions.push(...quiz.questions);
    mergedImageMetadata.push(...quiz.imageMetadata);
  }

  return {
    version: "v3",
    questions: mergedQuestions,
    imageMetadata: mergedImageMetadata,
  };
}

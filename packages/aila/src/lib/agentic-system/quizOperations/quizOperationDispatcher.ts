import type { LatestQuiz, LatestQuizQuestion } from "../../../protocol/schema";
import type { StructuralItemIntent } from "../schema";
import {
  type RunSingleItemFn,
  sectionListOperationDispatcher,
} from "./sectionListOperationDispatcher";

export type RunSingleQuestionFn = RunSingleItemFn<LatestQuizQuestion>;

export type QuizDispatchResult = {
  data: LatestQuiz;
  note?: string;
};

/**
 * Thin quiz adapter over the generic section-list dispatcher: unwrap the questions
 * array, run the operation, then re-wrap the quiz envelope. Quizzes have no item
 * count bounds (min 0, no max), matching the previous behaviour. When the edit is
 * declined the questions array comes back by reference, so the original quiz object
 * is returned unchanged.
 */
export async function quizOperationDispatcher(
  currentQuiz: LatestQuiz,
  intent: StructuralItemIntent,
  runSingleQuestion: RunSingleQuestionFn,
): Promise<QuizDispatchResult> {
  const result = await sectionListOperationDispatcher<LatestQuizQuestion>(
    currentQuiz.questions,
    intent,
    runSingleQuestion,
    {
      itemNoun: "question",
      min: 0,
      max: Number.POSITIVE_INFINITY,
      regenerateSuggestion: "Generate a new quiz",
    },
  );

  return {
    data:
      result.data === currentQuiz.questions
        ? currentQuiz
        : { ...currentQuiz, questions: result.data },
    note: result.note,
  };
}

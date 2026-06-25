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
 * Quiz adapter over the generic section-list dispatcher. A declined edit leaves
 * the quiz unchanged.
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

import type { Dispatch } from "react";
import { useCallback } from "react";

import { quizRequestGeneration } from "ai-apps/quiz-designer/quizRequestGeneration";
import type { QuizAppAction } from "ai-apps/quiz-designer/state/actions";
import { QuizAppActions } from "ai-apps/quiz-designer/state/actions";
import type {
  QuizAppState,
  QuizAppStateQuestion,
} from "ai-apps/quiz-designer/state/types";
import { z } from "zod";

import useGenerationCallbacks from "./useGenerationCallbacks";

type UseRegenerateDistractorsProps = {
  questionRow: QuizAppStateQuestion;
  questionIdx: number;
  dispatch: Dispatch<QuizAppAction>;
  state: QuizAppState;
};

const allDistractorRegenerationOutputSchema = z.object({
  regeneratedDistractors: z.array(z.string()),
});
const useRegenerateDistractors = ({
  state,
  dispatch,
  questionIdx,
  questionRow,
}: UseRegenerateDistractorsProps) => {
  const { requestGeneration, status, error } = useGenerationCallbacks(
    "quiz-generator",
    "regenerate-all-distractors-rag",
    allDistractorRegenerationOutputSchema,
    { timeout: 90000 },
    {
      onStart: ({ rateLimit }) => {
        dispatch({
          type: QuizAppActions.UpdateGenerationRateLimit,
          rateLimit,
        });
      },
      onSuccess: ({ data }) => {
        dispatch({
          type: QuizAppActions.RegeneratedAllDistractors,
          questionIdx,
          generationId: data.id,
          distractors: data.response.regeneratedDistractors,
        });
      },
    },
  );
  const lastGeneration = questionRow.distractors.find((distractor) =>
    Boolean(distractor.lastGenerationId),
  );
  const requestRegenerateAllDistractorsGeneration = useCallback(() => {
    quizRequestGeneration({
      state,
      questionRow,
      requestGeneration,
      lastGeneration,
    });
  }, [state, questionRow, requestGeneration, lastGeneration]);

  return {
    requestRegenerateAllDistractorsGeneration,
    status,
    error,
  };
};

export default useRegenerateDistractors;

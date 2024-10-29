import type { Dispatch} from "react";
import { useCallback } from "react";

import { quizRequestGeneration } from "ai-apps/quiz-designer/quizRequestGeneration";
import type {
  QuizAppAction} from "ai-apps/quiz-designer/state/actions";
import {
  QuizAppActions,
} from "ai-apps/quiz-designer/state/actions";
import type {
  QuizAppState,
  QuizAppStateQuestion,
} from "ai-apps/quiz-designer/state/types";
import { z } from "zod";

import useGenerationCallbacks from "./useGenerationCallbacks";

type UseRegenerateAnswersProps = {
  questionRow: QuizAppStateQuestion;
  questionIdx: number;
  dispatch: Dispatch<QuizAppAction>;
  state: QuizAppState;
};

const answerRegenerationOutputSchema = z.object({
  question: z.string(),
  answers: z.array(z.string()),
  regeneratedAnswers: z.array(z.string()),
});

const useRegenerateAnswers = ({
  state,
  dispatch,
  questionIdx,
  questionRow,
}: UseRegenerateAnswersProps) => {
  const { requestGeneration, status, error } = useGenerationCallbacks(
    "quiz-generator",
    "regenerate-answer-rag",
    answerRegenerationOutputSchema,
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
          type: QuizAppActions.RegeneratedAnswers,
          questionIdx,
          generationId: data.id,
          answers: data.response.regeneratedAnswers,
        });
      },
      onFailure: useCallback(() => {}, []),
    },
  );

  const lastGeneration = questionRow.answers.find((answer) =>
    Boolean(answer.lastGenerationId),
  );
  const requestRegenerateAnswersGeneration = useCallback(() => {
    quizRequestGeneration({
      state,
      questionRow,
      requestGeneration,
      lastGeneration,
    });
  }, [state, questionRow, requestGeneration, lastGeneration]);

  return {
    requestRegenerateAnswersGeneration,
    status,
    error,
  };
};

export default useRegenerateAnswers;

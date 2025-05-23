import { useCallback, useEffect, useState } from "react";

import { z } from "zod";

import { extraQuizPromptInfo } from "@/ai-apps/quiz-designer/extraQuizPromptInfo";
import type { QuizAppAction } from "@/ai-apps/quiz-designer/state/actions";
import { QuizAppActions } from "@/ai-apps/quiz-designer/state/actions";
import type { QuizAppState } from "@/ai-apps/quiz-designer/state/types";
import { QuizAppStatus } from "@/ai-apps/quiz-designer/state/types";
import { answersAndDistractorOutputSchema } from "@/components/AppComponents/QuizDesigner/QuizQuestionRow";
import { getAgesFromKeyStage } from "@/utils/getAgesFromKeyStage";
import { trpc } from "@/utils/trpc";

import { UseGenerationStatus, isGenerationHookLoading } from "./useGeneration";
import useGenerationCallbacks from "./useGenerationCallbacks";

type UseSuggestedQuestionsProps = {
  state: QuizAppState;
  dispatch: React.Dispatch<QuizAppAction>;
};

const suggestedQuestionsOutputSchema = z.array(
  answersAndDistractorOutputSchema,
);

export type PotentialQuestionsType = z.infer<
  typeof suggestedQuestionsOutputSchema
>;

const useSuggestedQuestions = ({
  state,
  dispatch,
}: UseSuggestedQuestionsProps) => {
  const [potentialNewQuestions, setPotentialNewQuestions] =
    useState<PotentialQuestionsType>([]);

  useEffect(() => {
    if (
      state.status === QuizAppStatus.EditingSubjectAndKS ||
      state.status === QuizAppStatus.Initial
    ) {
      setPotentialNewQuestions([]);
    }
  }, [state]);

  const {
    requestGeneration: requestSuggestedQuestionsGeneration,
    status,
    error,
  } = useGenerationCallbacks(
    "quiz-generator",
    "generate-questions-rag",
    suggestedQuestionsOutputSchema,
    { timeout: 90000 },
    {
      onStart: ({ rateLimit }) => {
        dispatch({
          type: QuizAppActions.UpdateGenerationRateLimit,
          rateLimit,
        });
      },
      onSuccess: ({ data }) => {
        setPotentialNewQuestions(data.response);
      },
    },
  );

  const promptTimings = trpc.app.timings.useQuery({
    appSlug: "quiz-generator",
    promptSlug: "generate-answers-and-distractors-rag",
  });

  const medianTimeTakenForPrompt =
    promptTimings.data?.["median-generation-total-duration-ms"];

  const suggestedQuestionsGeneration = useCallback(() => {
    const { otherQuestions, extraContext } = extraQuizPromptInfo({
      state,
    });
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    requestSuggestedQuestionsGeneration({
      lastGenerationId: null,
      // lastGenerationId: null,
      sessionId: state.sessionId ?? "",
      factQuestion: `${state.topic}: ${otherQuestions}`,
      addKnowledge: extraContext,
      addTranscript: extraContext,
      promptInputs: {
        sessionId: state.sessionId ?? "",
        otherQuestions,
        subject: state.subject,
        keyStage: state.keyStage,
        numberOfDistractors: 2,
        ageRange: getAgesFromKeyStage(state.keyStage),
        topic: state.topic,
      },
    });
  }, [state, requestSuggestedQuestionsGeneration]);

  const isLoading = isGenerationHookLoading(status);

  const hasError = status === UseGenerationStatus.ERROR && error;

  return {
    suggestedQuestionsGeneration,
    error,
    isLoading,
    hasError,
    potentialNewQuestions,
    medianTimeTakenForPrompt,
    setPotentialNewQuestions,
  };
};

export default useSuggestedQuestions;

import type { Dispatch } from "react";
import { useCallback } from "react";

import { Box, Flex } from "@radix-ui/themes";
import { quizRequestGeneration } from "ai-apps/quiz-designer/quizRequestGeneration";
import type { QuizAppAction } from "ai-apps/quiz-designer/state/actions";
import { QuizAppActions } from "ai-apps/quiz-designer/state/actions";
import type {
  QuizAppState,
  QuizAppStateQuestion,
} from "ai-apps/quiz-designer/state/types";
import type { GenerationWithResponse } from "hooks/useGeneration";
import {
  UseGenerationStatus,
  isGenerationHookLoading,
} from "hooks/useGeneration";
import useGenerationCallbacks from "hooks/useGenerationCallbacks";
import { z } from "zod";

import { GenerationErrorBox } from "@/components/AppComponents/QuizDesigner/ErrorBox";
import Input from "@/components/Input";
import { trpc } from "@/utils/trpc";

import GenerateButton from "../GenerateAllButton";

type QuestionProps = {
  questionIdx: number;
  dispatch: Dispatch<QuizAppAction>;
  hasQuestionBeenGenerated: boolean;
  questionRow: QuizAppStateQuestion;
  state: QuizAppState;
  suggestedQuestionsGeneration: () => void;
};

const answersAndDistractorOutputSchema = z.object({
  question: z.string(),
  answers: z.array(z.string()),
  distractors: z.array(z.string()),
});

type AnswersAndDistractorsOutput = z.infer<
  typeof answersAndDistractorOutputSchema
>;

const Question = ({
  questionIdx,
  dispatch,
  hasQuestionBeenGenerated,
  questionRow,
  state,
  suggestedQuestionsGeneration,
}: Readonly<QuestionProps>) => {
  const { requestGeneration, status, error } = useGenerationCallbacks(
    "quiz-generator",
    "generate-answers-and-distractors-rag",
    answersAndDistractorOutputSchema,
    { timeout: 90000 },
    {
      onStart: ({ rateLimit }) => {
        dispatch({
          type: QuizAppActions.UpdateGenerationRateLimit,
          rateLimit,
        });
      },
      onSuccess: ({ data }) => {
        dispatch(generatedAnswersAndDistractors(questionIdx, data));
      },
    },
  );

  const promptTimings = trpc.app.timings.useQuery({
    appSlug: "quiz-generator",
    promptSlug: "generate-answers-and-distractors-rag",
  });

  const medianTimeTakenForPrompt =
    promptTimings.data?.["median-generation-total-duration-ms"];

  const requestAnswersAndDistractorGeneration = useCallback(() => {
    const lastGeneration = [
      ...questionRow.answers,
      ...questionRow.distractors,
    ].find((answer) => Boolean(answer.lastGenerationId));

    quizRequestGeneration({
      state,
      questionRow,
      requestGeneration,
      lastGeneration,
    });
  }, [state, questionRow, requestGeneration]);

  const isLoading = isGenerationHookLoading(status);

  const hasError = status === UseGenerationStatus.ERROR && error;

  // Don't let the user attempt a generation if the question is empty
  const canGenerate = questionRow.question.value.trim() !== "";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canGenerate) {
          requestAnswersAndDistractorGeneration();
        }
      }}
      className="w-full"
    >
      <Box className="w-full">
        <Input
          type="text"
          label="Question"
          name={`question_${questionIdx}`}
          disabled={isLoading}
          /**
           * Note that state here is un-controlled, which isn't a problem as
           * the question value is never updated externally in the state.
           * If it will be in future, this will need changing to be fully
           * controlled
           */
          defaultValue={questionRow.question.value}
          onChange={(evt) => {
            if (!isLoading) {
              dispatch({
                type: QuizAppActions.UpdateQuestionText,
                questionIdx,
                questionText: evt.target.value,
              });
            }
          }}
        />
        <span className="-mt-10 mb-18 block text-sm">
          Please enter a question based on {state.keyStage}, {state.subject}
          {state.topic && ", " + state.topic}
        </span>

        <Flex direction="column" mb="4">
          <Flex direction="row" gap="4">
            {hasQuestionBeenGenerated ? (
              <GenerateButton
                buttonText="Regenerate answers & distractors"
                onClick={() => {
                  /**
                   * This is currently triggering the same prompt as
                   * the original Generate button, as we don't have a
                   * regenerate all prompt currently
                   */
                  if (canGenerate) {
                    requestAnswersAndDistractorGeneration();
                  }
                }}
                disabled={!canGenerate}
                icon="reload"
                isLoading={isLoading}
                promptID="generate-answers-and-distractors-rag"
                promptDescription="This prompt will regenerate an answer and all distractors based on the question you ask it."
                estimatedDurationMs={medianTimeTakenForPrompt}
              />
            ) : (
              <GenerateButton
                buttonText="Generate answers & distractors"
                onClick={() => {
                  if (canGenerate) {
                    requestAnswersAndDistractorGeneration();
                    suggestedQuestionsGeneration();
                  }
                }}
                disabled={!canGenerate}
                icon="arrow-right"
                isLoading={isLoading}
                promptID="generate-answers-and-distractors-rag"
                promptDescription="This prompt will generate an answer and distractors based on the question you ask it."
                estimatedDurationMs={medianTimeTakenForPrompt}
              />
            )}
          </Flex>

          {hasError && error && <GenerationErrorBox error={error} />}
        </Flex>
      </Box>
    </form>
  );
};

function generatedAnswersAndDistractors(
  questionIdx: number,
  data: GenerationWithResponse<AnswersAndDistractorsOutput>,
) {
  return {
    type: QuizAppActions.GeneratedAnswerAndDistractors,
    questionIdx,
    generationId: data.id,
    answers: data.response.answers,
    distractors: data.response.distractors,
  } as const;
}

export default Question;

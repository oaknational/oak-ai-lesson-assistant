/* eslint-disable react-hooks/exhaustive-deps */
// TODO - if we are maintaining the quiz designer, check the hook dependencies
import type { Dispatch } from "react";
import { useCallback, useState } from "react";

import type { GenerationPart } from "@oakai/core/src/types";
import { GenerationPartType } from "@oakai/core/src/types";
import browserLogger from "@oakai/logger/browser";
import { Flex } from "@radix-ui/themes";
import { z } from "zod";

import type { QuizAppAction } from "@/ai-apps/quiz-designer/state/actions";
import { QuizAppActions } from "@/ai-apps/quiz-designer/state/actions";
import type {
  QuizAppDistractor,
  QuizAppState,
  QuizAppStateQuestion,
} from "@/ai-apps/quiz-designer/state/types";
import { GenerationErrorBox } from "@/components/AppComponents/QuizDesigner/ErrorBox";
import {
  UseGenerationStatus,
  isGenerationHookLoading,
} from "@/hooks/useGeneration";
import useGenerationCallbacks from "@/hooks/useGenerationCallbacks";
import { getAgesFromKeyStage } from "@/utils/getAgesFromKeyStage";
import { trpc } from "@/utils/trpc";

import ActionButtonsGroup from "../../common/SingleGeneration/ActionButtonsGroup";
import GenerationInputAndText from "../../common/SingleGeneration/GenerationInputAndText";
import GenerationWrapper from "../../common/SingleGeneration/GenerationWrapper";

const Distractor = ({
  distractor,
  questionRow,
  questionIdx,
  distractorIdx,
  dispatch,
  state,
}: Readonly<DistractorProps>) => {
  const [userIsEditing, setUserIsEditing] = useState(false);

  const { requestGeneration, status, error } = useGenerationCallbacks(
    "quiz-generator",
    "regenerate-distractor-rag",
    quizDistractorRegenerationResultSchema,
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
          type: QuizAppActions.RegeneratedDistractor,
          questionIdx,
          distractorIdx,
          generationId: data.id,
          distractor: data.response.regeneratedDistractor,
        });
      },
    },
  );
  const recordUserTweak = trpc.generations.recordUserTweak.useMutation();

  const requestRegenerateDistractorGeneration = useCallback(() => {
    /**
     * @TODO: This isn't handling multiple answers very well
     */

    const otherQuestions = state.questions
      .filter((q) => q.question.value !== questionRow.question.value)
      .map(
        (q) =>
          `* Question: "${q.question.value}" / Correct: ${q.answers
            .map((a) => a.value)
            .join(", ")} / Distractors: ${q.distractors
            .map((d) => d.value)
            .join(", ")}`,
      )
      .join("\n");

    const extraContext = `${state.topic} : ${questionRow.question.value}. Other questions include: ${otherQuestions}`;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    requestGeneration({
      lastGenerationId: distractor.lastGenerationId,
      sessionId: state.sessionId as string,
      factQuestion: `${state.topic}: ${questionRow.question.value}`,
      addKnowledge: extraContext,
      addTranscript: extraContext,
      promptInputs: {
        question: questionRow.question.value,
        otherQuestions,
        subject: state.subject,
        keyStage: state.keyStage,
        ageRange: getAgesFromKeyStage(state.keyStage),
        topic: state.topic,
        numberOfCorrectAnswers: questionRow.numberOfAnswers,
        numberOfDistractors: 4 - questionRow.numberOfAnswers,
        distractorToRegenerate: distractor.value,
        answers: questionRow.answers.map((answer) => answer.value),
        distractors: questionRow.distractors.map(
          (distractor) => distractor.value,
        ),
      },
    });
  }, [
    requestGeneration,
    distractor.lastGenerationId,
    distractor.value,
    state.sessionId,
    state.subject,
    state.keyStage,
    state.topic,
    state.questions,
    questionRow.question.value,
    questionRow.numberOfAnswers,
    questionRow.answers,
    questionRow.distractors,
  ]);

  const isLoading = isGenerationHookLoading(status);

  const hasError = status === UseGenerationStatus.ERROR && error;

  const tweakDistractor = useCallback(
    async (distractorIdx: number, tweakedDistractor: string) => {
      dispatch({
        type: QuizAppActions.TweakedDistractor,
        questionIdx: questionIdx,
        distractorIdx: distractorIdx,
        tweakedDistractor: tweakedDistractor,
      });

      try {
        if (distractor.lastGenerationId) {
          // @TODO: De-dupe this same logic that happens in the reducer
          await recordUserTweak.mutateAsync({
            sessionId: state.sessionId as string,
            tweakedItem: {
              type: GenerationPartType.UserTweaked,
              value: tweakedDistractor,
              originalValue:
                distractor.type === GenerationPartType.UserTweaked
                  ? distractor.originalValue
                  : distractor.value,
              lastGenerationId: distractor.lastGenerationId,
            },
          });
        } else {
          browserLogger.error(
            "User attempted to tweak distractor with missing lastGenerationId",
          );
        }
      } catch {
        browserLogger.error("Failed to log distractor tweak");
      }
    },
    [
      dispatch,
      distractor.lastGenerationId,
      // TODO This looks like a bug
      // distractor?.originalValue,
      distractor.type,
      distractor.value,
      questionIdx,
      recordUserTweak,
      state.sessionId,
    ],
  );

  return (
    <GenerationWrapper
      generatedItem={distractor}
      sessionId={state.sessionId as string}
    >
      <Flex direction={{ initial: "column", sm: "row" }} gap="3">
        <Flex direction="column" className="w-full">
          <Flex direction="row" gap="2" py="1" justify="start">
            <GenerationInputAndText
              item={distractor}
              userIsEditing={userIsEditing}
              isLoading={isLoading}
              index={distractorIdx}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              tweak={tweakDistractor}
              setUserIsEditing={setUserIsEditing}
            >
              {distractor.value}
            </GenerationInputAndText>
          </Flex>
          <ActionButtonsGroup
            userIsEditing={userIsEditing}
            toggleEditState={() => setUserIsEditing(!userIsEditing)}
            isLoading={isLoading}
            requestRegenerate={requestRegenerateDistractorGeneration}
          />

          {hasError && error && <GenerationErrorBox error={error} />}
        </Flex>
      </Flex>
    </GenerationWrapper>
  );
};

type DistractorProps = {
  distractor: GenerationPart<QuizAppDistractor>;
  questionRow: QuizAppStateQuestion;
  questionIdx: number;
  distractorIdx: number;
  dispatch: Dispatch<QuizAppAction>;
  lastGenerationId: string | null;
  state: QuizAppState;
};

const quizDistractorRegenerationResultSchema = z.object({
  regeneratedDistractor: z.string(),
});
export default Distractor;

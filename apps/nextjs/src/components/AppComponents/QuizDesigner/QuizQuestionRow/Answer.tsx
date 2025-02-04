import { useCallback } from "react";

import type { GenerationPart } from "@oakai/core/src/types";
import { GenerationPartType } from "@oakai/core/src/types";
import browserLogger from "@oakai/logger/browser";
import { Flex } from "@radix-ui/themes";

import type { QuizAppAction } from "@/ai-apps/quiz-designer/state/actions";
import { QuizAppActions } from "@/ai-apps/quiz-designer/state/actions";
import type {
  QuizAppAnswer,
  QuizAppState,
  QuizAppStateQuestion,
} from "@/ai-apps/quiz-designer/state/types";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { trpc } from "@/utils/trpc";

import ActionButtonsGroup from "../../common/SingleGeneration/ActionButtonsGroup";
import GenerationInputAndText from "../../common/SingleGeneration/GenerationInputAndText";
import GenerationWrapper from "../../common/SingleGeneration/GenerationWrapper";

const Answer = ({
  answer,
  answerIdx,
  userIsEditing,
  isLoading,
  dispatch,
  setUserIsEditing,
  questionIdx,
  questionRow,
  state,
}: Readonly<AnswerProps>) => {
  const { trackEvent } = useAnalytics();
  const recordUserTweak = trpc.generations.recordUserTweak.useMutation();

  const tweakAnswer = useCallback(
    async (answerIdx: number, tweakedAnswer: string) => {
      trackEvent("quiz_designer:tweak_answer", {
        previous_answer: answer.value,
        new_answer: tweakedAnswer,
      });

      dispatch({
        type: QuizAppActions.TweakedAnswer,
        questionIdx,
        answerIdx,
        tweakedAnswer,
      });

      try {
        const answer = questionRow.answers[answerIdx];
        if (answer?.lastGenerationId) {
          // @TODO: De-dupe this same logic that happens in the reducer
          await recordUserTweak.mutateAsync({
            sessionId: state.sessionId as string,
            tweakedItem: {
              type: GenerationPartType.UserTweaked,
              value: tweakedAnswer,
              originalValue:
                answer.type === GenerationPartType.UserTweaked
                  ? answer.originalValue
                  : answer.value,
              lastGenerationId: answer.lastGenerationId,
            },
          });
        } else {
          browserLogger.error(
            "User attempted to tweak answer with missing answer / lastGenerationId",
          );
        }
      } catch {
        browserLogger.error("Failed to log answer tweak");
      }
    },
    [
      dispatch,
      questionIdx,
      questionRow.answers,
      recordUserTweak,
      state.sessionId,
      trackEvent,
      answer.value,
    ],
  );

  return (
    <GenerationWrapper
      generatedItem={answer}
      sessionId={state.sessionId as string}
    >
      <Flex direction="column" className="w-full">
        <GenerationInputAndText
          item={answer}
          userIsEditing={userIsEditing}
          isLoading={isLoading}
          index={answerIdx}
          setUserIsEditing={setUserIsEditing}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          tweak={tweakAnswer}
        >
          {answer.value}
        </GenerationInputAndText>
        <ActionButtonsGroup
          userIsEditing={userIsEditing}
          toggleEditState={() => setUserIsEditing(!userIsEditing)}
          isLoading={isLoading}
        />
      </Flex>
    </GenerationWrapper>
  );
};

type AnswerProps = {
  answer: GenerationPart<QuizAppAnswer>;
  answerIdx: number;
  userIsEditing: boolean;
  isLoading: boolean;
  setUserIsEditing: (value: boolean) => void;
  questionIdx: number;
  questionRow: QuizAppStateQuestion;
  dispatch: React.Dispatch<QuizAppAction>;
  state: QuizAppState;
};

export default Answer;

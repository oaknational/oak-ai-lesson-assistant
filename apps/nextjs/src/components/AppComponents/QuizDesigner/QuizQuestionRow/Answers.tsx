import type { Dispatch } from "react";
import { useState } from "react";

import { Box, Flex } from "@radix-ui/themes";

import type { QuizAppAction } from "@/ai-apps/quiz-designer/state/actions";
import type {
  QuizAppState,
  QuizAppStateQuestion,
} from "@/ai-apps/quiz-designer/state/types";
import { GenerationErrorBox } from "@/components/AppComponents/QuizDesigner/ErrorBox";
import { Icon } from "@/components/Icon";
import {
  UseGenerationStatus,
  isGenerationHookLoading,
} from "@/hooks/useGeneration";

import Skeleton from "../../common/Skeleton";
import Answer from "./Answer";

type AnswersProps = {
  questionRow: QuizAppStateQuestion;
  questionIdx: number;
  dispatch: Dispatch<QuizAppAction>;
  state: QuizAppState;
  status: UseGenerationStatus;
  error: Error | null;
};

const Answers = ({
  questionRow,
  questionIdx,
  dispatch,
  state,
  status,
  error,
}: Readonly<AnswersProps>) => {
  const isLoading = isGenerationHookLoading(status);
  const hasError = status === UseGenerationStatus.ERROR && error;

  const [userIsEditing, setUserIsEditing] = useState(false);

  return (
    <Box>
      {!isLoading &&
        questionRow.answers.map((answer, answerIdx) => {
          return (
            <Skeleton loaded={true} key={answer.value}>
              <Flex direction="row" className="w-full">
                <Box className="h-fit w-fit" mr="3" mt="2">
                  <Box className="flex scale-75 items-center justify-center rounded-full bg-pupilsHighlight p-6">
                    <Icon icon="tick" size="sm" />
                  </Box>
                </Box>
                <Box className="w-full max-w-[90%]">
                  <Answer
                    setUserIsEditing={setUserIsEditing}
                    questionIdx={questionIdx}
                    questionRow={questionRow}
                    state={state}
                    isLoading={isLoading}
                    userIsEditing={userIsEditing}
                    answerIdx={answerIdx}
                    dispatch={dispatch}
                    answer={answer}
                  />
                </Box>
              </Flex>
            </Skeleton>
          );
        })}

      {hasError && error && <GenerationErrorBox error={error} />}
    </Box>
  );
};

export default Answers;

import type { Dispatch } from "react";

import { Box, Flex } from "@radix-ui/themes";
import type { QuizAppAction } from "ai-apps/quiz-designer/state/actions";
import type {
  QuizAppState,
  QuizAppStateQuestion,
} from "ai-apps/quiz-designer/state/types";
import {
  UseGenerationStatus,
  isGenerationHookLoading,
} from "hooks/useGeneration";

import { GenerationErrorBox } from "@/components/AppComponents/QuizDesigner/ErrorBox";
import { Icon } from "@/components/Icon";

import Skeleton from "../../common/Skeleton";
import Distractor from "./Distractor";

type DistractorsProps = {
  questionRow: QuizAppStateQuestion;
  questionIdx: number;
  dispatch: Dispatch<QuizAppAction>;
  state: QuizAppState;
  status: UseGenerationStatus;
  error: Error | null;
};

const Distractors = ({
  questionRow,
  questionIdx,
  dispatch,
  state,
  status,
  error,
}: Readonly<DistractorsProps>) => {
  const isLoading = isGenerationHookLoading(status);

  const hasError = status === UseGenerationStatus.ERROR && error;

  return (
    <Box>
      {hasError && error && <GenerationErrorBox error={error} />}

      {!isLoading && (
        <Box className="w-full">
          {questionRow.distractors.map((distractor, distractorIdx) => {
            return (
              <Skeleton loaded={true} key={distractor.value}>
                <Flex direction="row" className="w-full">
                  <Box className="h-fit w-fit" mr="3" mt="2">
                    <Box className="flex scale-75 items-center justify-center rounded-full bg-warning p-6">
                      <Icon icon="cross" size="sm" />
                    </Box>
                  </Box>
                  <Box className="w-full max-w-[90%]">
                    <Distractor
                      distractor={distractor}
                      questionRow={questionRow}
                      questionIdx={questionIdx}
                      distractorIdx={distractorIdx}
                      dispatch={dispatch}
                      lastGenerationId={distractor.lastGenerationId}
                      state={state}
                    />
                  </Box>
                </Flex>
              </Skeleton>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default Distractors;

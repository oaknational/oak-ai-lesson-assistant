import type { Dispatch } from "react";

import { Box, Flex, Grid, Text } from "@radix-ui/themes";

import type { QuizAppAction } from "@/ai-apps/quiz-designer/state/actions";
import LoadingWheel from "@/components/LoadingWheel";
import type { UseGenerationError } from "@/hooks/useGeneration";
import type { PotentialQuestionsType } from "@/hooks/useSuggestedQuestions";

import ChatButton from "../Chat/ui/chat-button";
import { GenerationErrorBox } from "./ErrorBox";
import SuggestedLessonCard from "./SuggestedQuestionCard";

export type SuggestedQuestionsProps = Readonly<{
  suggestedQuestionsError: UseGenerationError | null;
  suggestedQuestionsLoading: boolean;
  suggestedQuestionsHasError: false | UseGenerationError | null;
  potentialNewQuestions: PotentialQuestionsType;
  dispatch: Dispatch<QuizAppAction>;
  suggestedQuestionsGeneration: () => void;
  setPotentialNewQuestions: React.Dispatch<PotentialQuestionsType>;
  questionsWrapperRef: React.RefObject<HTMLDivElement>;
  questionRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}>;

const SuggestedQuestions = ({
  suggestedQuestionsGeneration,
  suggestedQuestionsError,
  suggestedQuestionsLoading,
  suggestedQuestionsHasError,
  potentialNewQuestions,
  setPotentialNewQuestions,
  dispatch,
  questionsWrapperRef,
  questionRefs,
}: SuggestedQuestionsProps) => {
  return (
    <>
      {suggestedQuestionsHasError && suggestedQuestionsError && (
        <GenerationErrorBox error={suggestedQuestionsError} />
      )}
      <Box my="8">
        {suggestedQuestionsLoading ? (
          <Flex align="center" gap="4">
            <LoadingWheel />
            <Text>More questions...</Text>
          </Flex>
        ) : (
          <>
            {potentialNewQuestions.length > 0 && (
              <Flex direction={"column"} gap="5">
                <p>Add questions...</p>
                <Grid
                  columns={{
                    initial: "1",
                    md: "2",
                  }}
                  gap="5"
                >
                  {potentialNewQuestions?.map((answer, i) => {
                    if (i < 2)
                      return (
                        <SuggestedLessonCard
                          dispatch={dispatch}
                          answer={answer}
                          key={answer.question}
                          potentialNewQuestions={potentialNewQuestions}
                          setPotentialNewQuestions={setPotentialNewQuestions}
                          questionsWrapperRef={questionsWrapperRef}
                          questionRefs={questionRefs}
                        />
                      );
                  })}
                </Grid>
                <Box mt="3">
                  <ChatButton
                    icon="reload"
                    variant="primary"
                    onClick={() => {
                      suggestedQuestionsGeneration();
                    }}
                  >
                    Load more
                  </ChatButton>
                </Box>
              </Flex>
            )}
          </>
        )}
      </Box>
    </>
  );
};

export default SuggestedQuestions;

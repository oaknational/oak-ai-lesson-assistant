import { Dispatch } from "react";

import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import {
  QuizAppAction,
  QuizAppActions,
} from "ai-apps/quiz-designer/state/actions";
import {
  QuizAppState,
  QuizAppStateQuestion,
} from "ai-apps/quiz-designer/state/types";
import { cva } from "class-variance-authority";
import useRegenerateAnswers from "hooks/useRegenerateAnswers";
import useRegenerateDistractors from "hooks/useRegenerateDistractors";
import { z } from "zod";

import Input from "@/components/Input";
import useAnalytics from "@/lib/analytics/useAnalytics";

import ChatButton from "../../Chat/ui/chat-button";
import Answers from "./Answers";
import Distractors from "./Distractors";
import Question from "./Question";
import RegenButtonGroup from "./RegenButtonGroup";

type QuizQuestionRowProps = {
  questionIdx: number;
  questionRow: QuizAppStateQuestion;
  state: QuizAppState;
  dispatch: Dispatch<QuizAppAction>;
  isLessonPlan?: boolean;
  suggestedQuestionsGeneration: () => void;
  ref: React.RefCallback<HTMLDivElement>;
};

function isOddOrEven(i: number) {
  return (i + 1) % 2 === 0 ? "even" : "odd";
}

const quizQuestionRows = cva(
  [
    "before:absolute before:left-[-50vw] before:top-0 before:-z-10 before:h-full before:w-[150vw]",
    "relative z-10 py-24",
    "border-b border-black border-opacity-10",
  ],
  {
    variants: {
      oddOrEven: {
        odd: "",
        even: "",
        lessonPlan: "",
        // odd: "before:bg-pink50",
        // even: "before:bg-pupilsLightGreen",
        // lessonPlan: "before:bg-lemon30",
      },
    },
  },
);

export const answersAndDistractorOutputSchema = z.object({
  question: z.string(),
  answers: z.array(z.string()),
  distractors: z.array(z.string()),
});

export function QuizQuestionRow({
  questionRow,
  questionIdx,
  state,
  dispatch,
  isLessonPlan,
  suggestedQuestionsGeneration,
  ref,
}: Readonly<QuizQuestionRowProps>) {
  const { trackEvent } = useAnalytics();

  // This is a proxy for has the user clicked generate
  // we could explicitly flag that they have instead if we need
  const hasQuestionBeenGenerated = questionRow.answers.length > 0;
  const canDeleteQuestion = state.questions.length > 1;
  let isRowOddOrEvenOrLessonPlan:
    | "odd"
    | "even"
    | "lessonPlan"
    | null
    | undefined = null;
  if (isLessonPlan) {
    isRowOddOrEvenOrLessonPlan = "lessonPlan";
  } else {
    isRowOddOrEvenOrLessonPlan = isOddOrEven(questionIdx);
  }
  const {
    requestRegenerateAllDistractorsGeneration,
    status: distractorStatus,
    error: distractorError,
  } = useRegenerateDistractors({
    state,
    dispatch,
    questionIdx,
    questionRow,
  });

  const {
    requestRegenerateAnswersGeneration,
    status: answersStatus,
    error: answersError,
  } = useRegenerateAnswers({
    state,
    dispatch,
    questionIdx,
    questionRow,
  });

  return (
    <div
      ref={ref}
      key={questionIdx}
      className={quizQuestionRows({ oddOrEven: isRowOddOrEvenOrLessonPlan })}
    >
      <Flex width="100%" justify="between">
        <Heading as="h2" size="6" className=" whitespace-nowrap bg-white">
          Question {questionIdx + 1}
        </Heading>

        <ChatButton
          icon="cross"
          variant="text-link"
          iconPosition="leading"
          disabled={!canDeleteQuestion}
          onClick={() => {
            // @TODO: Don't allow deletion while a generation
            // is happening, or we could end up with weird updates
            // being applied to elements at the wrong index
            // A better solution would be to look up and update questions
            // by an ID key generated on creation
            // questions becomes an object of {[id]: question}
            // with a `questionOrder: id[]` field
            if (canDeleteQuestion) {
              dispatch({
                type: QuizAppActions.DeleteQuestion,
                questionIdx,
              });
              trackEvent("quiz_designer:delete_question");
            }
          }}
        >
          Delete question
        </ChatButton>
      </Flex>
      <Flex
        direction={{
          initial: "column",
          sm: "row",
        }}
        className="w-full gap-12  sm:gap-24 "
      >
        <Flex direction={"column"} className="min-w-[160px] gap-12">
          <Flex direction="column" justify={"start"} align={"start"}>
            <Box className="w-full">
              <Input
                type="dropdown"
                label=""
                name={`numberOfCorrectAnswers_${questionIdx}`}
                onChange={(e) => {
                  dispatch({
                    type: QuizAppActions.UpdateNumberOfCorrectAnswers,
                    numberOfAnswers: parseInt(e.target.value),
                    questionIdx,
                  });
                }}
                options={[1, 2]}
              />
            </Box>
            <Text className="mt-[-18px] text-sm">No of correct answers</Text>
          </Flex>
        </Flex>
        <Flex direction="column" width="100%">
          <Question
            questionIdx={questionIdx}
            dispatch={dispatch}
            hasQuestionBeenGenerated={hasQuestionBeenGenerated}
            questionRow={questionRow}
            state={state}
            suggestedQuestionsGeneration={suggestedQuestionsGeneration}
          />

          {hasQuestionBeenGenerated && (
            <Answers
              questionRow={questionRow}
              questionIdx={questionIdx}
              dispatch={dispatch}
              state={state}
              error={answersError}
              status={answersStatus}
            />
          )}

          {hasQuestionBeenGenerated && (
            <Distractors
              questionRow={questionRow}
              questionIdx={questionIdx}
              dispatch={dispatch}
              state={state}
              error={distractorError}
              status={distractorStatus}
            />
          )}
          {hasQuestionBeenGenerated && (
            <Box>
              <RegenButtonGroup
                answersStatus={answersStatus}
                distractorStatus={distractorStatus}
                requestRegenerateAnswersGeneration={
                  requestRegenerateAnswersGeneration
                }
                requestRegenerateAllDistractorsGeneration={
                  requestRegenerateAllDistractorsGeneration
                }
              />
            </Box>
          )}
        </Flex>
      </Flex>
    </div>
  );
}

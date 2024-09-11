import { Dispatch, useRef } from "react";

import { Box, Container } from "@radix-ui/themes";
import { QuizAppAction } from "ai-apps/quiz-designer/state/actions";
import { QuizAppState, QuizAppStatus } from "ai-apps/quiz-designer/state/types";
import useShareContent from "hooks/useShareContent";
import useSuggestedQuestions from "hooks/useSuggestedQuestions";

import SuggestedLessons from "../common/SuggestedLessons";
import Hero from "./Hero";
import { QuizQuestionRow } from "./QuizQuestionRow";
import ControllerRow from "./QuizQuestionRow/ControllerRow";
import SuggestedQuestions from "./SuggestedQuestions";

type QuizContentProps = {
  state: QuizAppState;
  dispatch: Dispatch<QuizAppAction>;
  toggleExportMenu: () => void;
};

const QuizContent = ({
  state,
  dispatch,
  toggleExportMenu,
}: Readonly<QuizContentProps>) => {
  const questionsWrapperRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { shareContent, shareId, shareLoading } = useShareContent({
    state,
  });
  const hasQuestions = state.questions.length > 0;
  const canExport =
    hasQuestions && state.status === QuizAppStatus.EditingQuestions;

  const {
    error: suggestedQuestionsError,
    suggestedQuestionsGeneration,
    potentialNewQuestions,
    isLoading: suggestedQuestionsLoading,
    hasError: suggestedQuestionsHasError,
    setPotentialNewQuestion,
  } = useSuggestedQuestions({
    state,
    dispatch,
  });

  return (
    <Container className=" min-h-[800px]">
      <Hero
        state={state}
        dispatch={dispatch}
        questionsWrapperRef={questionsWrapperRef}
      />

      <Box ref={questionsWrapperRef} className="scroll-mt-30">
        <div
          style={
            state.status !== QuizAppStatus.EditingQuestions
              ? { opacity: 0.5 }
              : {}
          }
        >
          {state.questions.map((questionRow, questionIdx) => {
            return (
              <QuizQuestionRow
                key={`QuizContent-QuestionRow-${questionIdx}`}
                ref={(el) => (questionRefs.current[questionIdx] = el)}
                questionRow={questionRow}
                questionIdx={questionIdx}
                state={state}
                dispatch={dispatch}
                suggestedQuestionsGeneration={suggestedQuestionsGeneration}
              />
            );
          })}
        </div>

        <SuggestedQuestions
          suggestedQuestionsError={suggestedQuestionsError}
          suggestedQuestionsLoading={suggestedQuestionsLoading}
          suggestedQuestionsHasError={suggestedQuestionsHasError}
          potentialNewQuestions={potentialNewQuestions}
          dispatch={dispatch}
          suggestedQuestionsGeneration={suggestedQuestionsGeneration}
          setPotentialNewQuestions={setPotentialNewQuestion}
          questionsWrapperRef={questionsWrapperRef}
          questionRefs={questionRefs}
        />

        {state.questions[0]?.answers !== undefined &&
          state.questions[0]?.answers.length > 0 && (
            <>
              <ControllerRow
                dispatch={dispatch}
                canExport={canExport}
                hasQuestions={hasQuestions}
                toggleExportMenu={toggleExportMenu}
                shareContent={shareContent}
                shareId={shareId}
                shareLoading={shareLoading}
              />
              <SuggestedLessons
                state={state}
                queryForLookUp={
                  state.topic +
                  state?.questions?.map((q) => q.question.value).join("")
                }
              />
            </>
          )}
      </Box>
    </Container>
  );
};

export default QuizContent;

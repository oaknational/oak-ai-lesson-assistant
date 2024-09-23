import { Dispatch, useRef } from "react";

import { Box, Container } from "@radix-ui/themes";
import useSuggestedQuestions from "hooks/useSuggestedQuestions";

import ExportMenu from "@/components/AppComponents/QuizDesigner/ExportMenu";
import Hero from "@/components/AppComponents/QuizDesigner/Hero";
import { QuizQuestionRow } from "@/components/AppComponents/QuizDesigner/QuizQuestionRow";
import ControllerRow from "@/components/AppComponents/QuizDesigner/QuizQuestionRow/ControllerRow";
import RateLimitNotification from "@/components/AppComponents/common/RateLimitNotification";
import Layout from "@/components/Layout";

import { QuizAppAction } from "../../../ai-apps/quiz-designer/state/actions";
import {
  QuizAppState,
  QuizAppStatus,
} from "../../../ai-apps/quiz-designer/state/types";
import SuggestedQuestions from "./SuggestedQuestions";

type Props = {
  state: QuizAppState;
  dispatch: Dispatch<QuizAppAction>;
  isExportMenuOpen: boolean;
  toggleExportMenu: () => void;
  questionsWrapperRef: React.RefObject<HTMLDivElement>;
  canExport: boolean;
  hasQuestions: boolean;
  shareContent: () => void;
  shareId: string | null;
  shareLoading: boolean;
};

const QuizDesignerPageContent = ({
  state,
  dispatch,
  isExportMenuOpen,
  toggleExportMenu,
  questionsWrapperRef,
  canExport,
  hasQuestions,
  shareContent,
  shareId,
  shareLoading,
}: Props) => {
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

  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  return (
    <>
      <ExportMenu
        isOpen={isExportMenuOpen}
        toggleIsOpen={toggleExportMenu}
        quizData={state}
      />
      <Layout>
        <RateLimitNotification rateLimit={state.rateLimit} />

        <Container className="min-h-[800px]">
          <Hero
            state={state}
            dispatch={dispatch}
            questionsWrapperRef={questionsWrapperRef}
          />
          <Box ref={questionsWrapperRef}>
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
                    key={questionIdx}
                    questionRow={questionRow}
                    questionIdx={questionIdx}
                    state={state}
                    dispatch={dispatch}
                    ref={(el) => {
                      questionRefs.current[questionIdx] = el;
                    }}
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
              setPotentialNewQuestions={setPotentialNewQuestion}
              suggestedQuestionsGeneration={suggestedQuestionsGeneration}
              questionRefs={questionRefs}
              questionsWrapperRef={questionsWrapperRef}
            />

            {state.questions[0]?.answers !== undefined &&
              state.questions[0]?.answers.length > 0 && (
                <ControllerRow
                  dispatch={dispatch}
                  canExport={canExport}
                  hasQuestions={hasQuestions}
                  toggleExportMenu={toggleExportMenu}
                  shareContent={shareContent}
                  shareId={shareId}
                  shareLoading={shareLoading}
                />
              )}
          </Box>
        </Container>
      </Layout>
    </>
  );
};

export default QuizDesignerPageContent;

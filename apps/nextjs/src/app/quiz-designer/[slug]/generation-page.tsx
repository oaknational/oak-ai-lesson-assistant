"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { useUser } from "@clerk/nextjs";

import { QuizAppActions } from "@/ai-apps/quiz-designer/state/actions";
import { quizAppReducer } from "@/ai-apps/quiz-designer/state/reducer";
import { QuizAppStatus } from "@/ai-apps/quiz-designer/state/types";
import QuizDesignerPageContent from "@/components/AppComponents/QuizDesigner/QuizDesignerPageContent";
import useShareContent from "@/hooks/useShareContent";
import { trpc } from "@/utils/trpc";

import { initialState } from "../quiz-designer-page";

export default function QuizDesignerPage({ data }) {
  const stateFromProps = data;

  const [state, dispatch] = useReducer(quizAppReducer, initialState);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const user = useUser();

  useEffect(() => {
    if (user.isLoaded && !user.isSignedIn) {
      window.location.href = "/sign-up";
    }
  }, [user.isLoaded, user.isSignedIn]);

  const hasQuestions = state.questions.length > 0;
  const canExport =
    hasQuestions && state.status === QuizAppStatus.EditingQuestions;

  const toggleExportMenu = useCallback(() => {
    setIsExportMenuOpen((open) => !open);
  }, []);

  const questionsWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.sessionId === initialState.sessionId) {
      const sessionId = stateFromProps.sessionId;
      const sessionWithCorrectedStatus = {
        ...stateFromProps,
        status: QuizAppStatus.EditingQuestions,
      };
      if (sessionId) {
        dispatch({
          type: QuizAppActions.RestoreSession,
          session: sessionWithCorrectedStatus,
        });
        questionsWrapperRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }
    }
  }, [
    stateFromProps,
    state.sessionId,
    state.status,
    stateFromProps.sessionId,
    stateFromProps.status,
  ]);

  const updateOutputTrpc = trpc.app.updateSessionState.useMutation({});
  const updateOutputMutation = updateOutputTrpc.mutateAsync;
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { rateLimit, sessionId, ...restOfState } = state;

    if (state.sessionId) {
      updateOutputMutation({
        sessionId: state.sessionId,
        output: restOfState,
      });
    }
  }, [state, updateOutputMutation]);

  const { shareContent, shareId, shareLoading } = useShareContent({
    state: state,
  });

  return (
    <QuizDesignerPageContent
      state={state}
      dispatch={dispatch}
      isExportMenuOpen={isExportMenuOpen}
      toggleExportMenu={toggleExportMenu}
      questionsWrapperRef={questionsWrapperRef}
      canExport={canExport}
      hasQuestions={hasQuestions}
      shareContent={shareContent}
      shareId={shareId}
      shareLoading={shareLoading}
    />
  );
}

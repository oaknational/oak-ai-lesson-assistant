"use client";

import { memo, useCallback, useEffect, useReducer, useState } from "react";

import { aiLogger } from "@oakai/logger";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { equals } from "remeda";

import { quizAppReducer } from "@/ai-apps/quiz-designer/state/reducer";
import type { QuizAppState } from "@/ai-apps/quiz-designer/state/types";
import { QuizAppStatus } from "@/ai-apps/quiz-designer/state/types";
import ExportMenu from "@/components/AppComponents/QuizDesigner/ExportMenu";
import QuizContent from "@/components/AppComponents/QuizDesigner/QuizContent";
import QuizRestoreDialog from "@/components/AppComponents/QuizDesigner/QuizRestoreDialog";
import RateLimitNotification from "@/components/AppComponents/common/RateLimitNotification";
import { RestoreDialogRoot } from "@/components/AppComponents/common/RestoreDialog";
import Layout from "@/components/Layout";
import { useQuizSession } from "@/hooks/useQuizSession";
import { trpc } from "@/utils/trpc";

const log = aiLogger("qd");

export const initialState: QuizAppState = {
  status: QuizAppStatus.Initial,
  sessionId: null,
  subject: "",
  keyStage: "",
  topic: "",
  questions: [],
  rateLimit: null,
};

export const QuizDesignerPage = () => {
  const router = useRouter();
  const user = useUser();
  useEffect(() => {
    if (user.isLoaded && !user.isSignedIn) {
      router.replace("/sign-up");
    }
  }, [user.isLoaded, user.isSignedIn, router]);
  return <QuizDesignerPageContent />;
};

function QuizDesignerPageContent() {
  const [state, dispatch] = useReducer(quizAppReducer, initialState);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const toggleExportMenu = useCallback(() => {
    setIsExportMenuOpen((open) => !open);
  }, [setIsExportMenuOpen]);

  const [restoreDialogIsOpen, setRestoreDialogIsOpen] = useState(false);
  useQuizSession({
    state,
    dispatch,
    setRestoreDialogIsOpen,
  });

  return (
    <RestoreDialogRoot
      open={restoreDialogIsOpen}
      onOpenChange={setRestoreDialogIsOpen}
    >
      <MemoizedStatePersistence state={state} />
      <QuizRestoreDialog
        dispatch={dispatch}
        state={state}
        setIsOpen={setRestoreDialogIsOpen}
      />
      <ExportMenu
        isOpen={isExportMenuOpen}
        toggleIsOpen={toggleExportMenu}
        quizData={state}
      />
      <Layout>
        <RateLimitNotification rateLimit={state.rateLimit} />
        <QuizContent
          state={state}
          dispatch={dispatch}
          toggleExportMenu={toggleExportMenu}
        />
      </Layout>
    </RestoreDialogRoot>
  );
}

const StatePersistence = ({ state }: Readonly<{ state: QuizAppState }>) => {
  const updateSessionStateMutation = trpc.app.updateSessionState.useMutation(
    {},
  );

  const updateSessionStateMutationCall = updateSessionStateMutation.mutateAsync;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { rateLimit, sessionId, ...restOfState } = state;

    if (state.status === QuizAppStatus.EditingQuestions) {
      const formatState = JSON.stringify(state);
      log.info("Store state in local storage");
      localStorage.setItem("quizData", formatState);
    }

    if (state.sessionId) {
      log.info("Update session state", { state });
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      updateSessionStateMutationCall({
        sessionId: state.sessionId,
        output: restOfState,
      });
    }
  }, [state, updateSessionStateMutationCall]);

  return null;
};

const MemoizedStatePersistence = memo(
  StatePersistence,
  (oldProps, newProps) => {
    log.info({ oldProps, newProps });
    return equals(oldProps.state, newProps.state);
  },
);

export default QuizDesignerPage;

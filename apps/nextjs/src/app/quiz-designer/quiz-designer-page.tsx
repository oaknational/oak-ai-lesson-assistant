"use client";

import { memo, useCallback, useEffect, useReducer, useState } from "react";

import { useUser } from "@clerk/nextjs";
import { buildClerkProps, getAuth } from "@clerk/nextjs/server";
import { quizAppReducer } from "ai-apps/quiz-designer/state/reducer";
import { QuizAppState, QuizAppStatus } from "ai-apps/quiz-designer/state/types";
import { useQuizSession } from "hooks/useQuizSession";
import { GetServerSideProps } from "next";
import { useRouter } from "next/navigation";
import { equals } from "remeda";

import ExportMenu from "@/components/AppComponents/QuizDesigner/ExportMenu";
import QuizContent from "@/components/AppComponents/QuizDesigner/QuizContent";
import QuizRestoreDialog from "@/components/AppComponents/QuizDesigner/QuizRestoreDialog";
import RateLimitNotification from "@/components/AppComponents/common/RateLimitNotification";
import { RestoreDialogRoot } from "@/components/AppComponents/common/RestoreDialog";
import Layout from "@/components/Layout";
import { trpc } from "@/utils/trpc";

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
      console.log("Store state in local storage");
      localStorage.setItem("quizData", formatState);
    }

    if (state.sessionId) {
      console.log("Update session state", { state });
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
    console.log({ oldProps, newProps });
    return equals(oldProps.state, newProps.state);
  },
);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);

  if (!userId) {
    return {
      redirect: {
        destination: "/sign-up",
        permanent: false,
      },
    };
  }

  return { props: { ...buildClerkProps(ctx.req) } };
};

export default QuizDesignerPage;

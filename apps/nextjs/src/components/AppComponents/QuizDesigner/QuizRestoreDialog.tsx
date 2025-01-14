import type { Dispatch } from "react";
import { useCallback } from "react";

import * as Sentry from "@sentry/nextjs";

import type { QuizAppAction } from "@/ai-apps/quiz-designer/state/actions";
import { QuizAppActions } from "@/ai-apps/quiz-designer/state/actions";
import type { QuizAppState } from "@/ai-apps/quiz-designer/state/types";
import { trpc } from "@/utils/trpc";

import RestoreDialog from "../common/RestoreDialog";

type QuizRestoreDialogProps = {
  dispatch: Dispatch<QuizAppAction>;
  state: QuizAppState;
  setIsOpen: (b: boolean) => void;
};

const QuizRestoreDialog = ({
  dispatch,
  state,
  setIsOpen,
}: Readonly<QuizRestoreDialogProps>) => {
  const { keyStage, subject, topic } = state;
  const createSessionMutation = trpc.app.createSession.useMutation({
    retry: 1,
  });

  async function createSessionId() {
    try {
      const session = await createSessionMutation.mutateAsync({
        appSlug: "quiz-generator",
      });
      return session.id;
    } catch (err) {
      if (err instanceof Error || typeof err === "string") {
        Sentry.captureException(new Error("Failed to create a new session"), {
          extra: { originalError: err },
        });
      }
      dispatch({
        type: QuizAppActions.EncounteredNonRecoverableError,
      });
    }
  }
  async function handleReset() {
    const sessionId = await createSessionId();
    localStorage.removeItem("quizData");

    if (sessionId) {
      dispatch({
        type: QuizAppActions.ResetSession,
        sessionId: sessionId,
      });
    }
  }

  const closeRestoreDialog = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const info = [keyStage, subject, topic].filter((i) => i && i !== "");
  const bodyText = `You have a quiz in progress: 
  ${info.join(", ")}. 
  Would you like to restore it? If not, you can start a new quiz at any time.`;

  return (
    <RestoreDialog
      closeDialog={closeRestoreDialog}
      handleReset={handleReset}
      titleText="Restore Quiz?"
      bodyText={bodyText}
      restoreButtonText="Restore"
      startNewButtonText="Start New"
    />
  );
};

export default QuizRestoreDialog;

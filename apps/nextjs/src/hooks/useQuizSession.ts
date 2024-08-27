import { Dispatch, useEffect, useRef } from "react";

import { useUser } from "@clerk/nextjs";
import browserLogger from "@oakai/logger/browser";
import * as Sentry from "@sentry/nextjs";
import { parseLocalStorageData } from "ai-apps/common/parseLocalStorageData";
import {
  QuizAppAction,
  QuizAppActions,
} from "ai-apps/quiz-designer/state/actions";
import { QuizAppState, QuizAppStatus } from "ai-apps/quiz-designer/state/types";
import { z } from "zod";

import { trpc } from "@/utils/trpc";

import { usePreviousValue } from "./usePreviousValue";

const quizStateSchema = z
  .object({
    status: z.nativeEnum(QuizAppStatus),
    sessionId: z.string(),
  })
  .passthrough();

type UseQuizSessionProps = {
  state: QuizAppState;
  dispatch: Dispatch<QuizAppAction>;
  setRestoreDialogIsOpen: (isOpen: boolean) => void;
};
/**
 * A hook to manage session persistence
 * - Creating new sessions
 * - Restoring existing sessions from localStorage
 * - Resetting a session
 */
export const useQuizSession = ({
  state,
  dispatch,
  setRestoreDialogIsOpen,
}: Readonly<UseQuizSessionProps>) => {
  const previousStatus = usePreviousValue(state.status);
  const user = useUser();
  const sessionCreationAttempted = useRef(false);

  const createSession = trpc.app.createSession.useMutation({
    retry: 1,
  });

  const createSessionMutation = createSession.mutateAsync;

  useEffect(() => {
    browserLogger.debug("user.isLoaded=%s", user.isLoaded);
  }, [user.isLoaded]);

  useEffect(() => {
    async function createSessionId() {
      try {
        const session = await createSessionMutation({
          appSlug: "quiz-generator",
        });
        return session.id;
      } catch (err) {
        if (err instanceof Error || typeof err === "string") {
          Sentry.withScope(function (scope) {
            scope.setLevel("info");
            Sentry.captureException(err);
          });
        }
        dispatch({
          type: QuizAppActions.EncounteredNonRecoverableError,
        });
      }
    }

    /**
     * If the user has a valid quiz session in their localStorage, restore it
     * otherwise if missing or invalid, create a new session
     *
     * Should be attempted only once, and when implicit deps
     * (userID) have loaded
     */
    if (
      state.status === QuizAppStatus.Initial &&
      !sessionCreationAttempted.current
    ) {
      const parsedData = parseLocalStorageData("quizData", quizStateSchema);
      if (parsedData) {
        sessionCreationAttempted.current = true;
        setRestoreDialogIsOpen(true);
        dispatch({
          type: QuizAppActions.RestoreSession,
          session: parsedData as QuizAppState,
        });
      } else {
        setRestoreDialogIsOpen(false);
        (async () => {
          if (!sessionCreationAttempted.current) {
            sessionCreationAttempted.current = true;
            const sessionId = await createSessionId();
            localStorage.removeItem("quizData");

            if (sessionId) {
              dispatch({
                type: QuizAppActions.CreateSession,
                sessionId: sessionId,
              });
            }
          }
        })();
      }
    } else if (
      /**
       * Only reset when we transition into ResettingQuiz
       * status, so that it doesn't fire multiple times
       */
      previousStatus !== QuizAppStatus.ResettingQuiz &&
      state.status === QuizAppStatus.ResettingQuiz
    ) {
      setRestoreDialogIsOpen(false);
      (async () => {
        const sessionId = await createSessionId();
        localStorage.removeItem("quizData");

        if (sessionId) {
          dispatch({
            type: QuizAppActions.ResetSession,
            sessionId: sessionId,
          });
        }
      })();
    }
  }, [
    createSessionMutation,
    dispatch,
    previousStatus,
    setRestoreDialogIsOpen,
    state,
    user.isLoaded,
  ]);
};

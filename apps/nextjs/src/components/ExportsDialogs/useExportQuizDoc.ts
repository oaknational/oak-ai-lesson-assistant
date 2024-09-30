import { useCallback, useEffect, useMemo, useState } from "react";

import { exportDocQuizSchema } from "@oakai/exports/browser";
import { QuizDocInputData } from "@oakai/exports/src/schema/input.schema";
import * as Sentry from "@sentry/nextjs";
import { useDebounce } from "@uidotdev/usehooks";
import { ZodError } from "zod";

import { trpc } from "@/utils/trpc";

import { ExportsHookProps } from "./exports.types";

export function useExportQuizDoc({
  onStart,
  quizType,
  lesson,
  active,
  chatId,
  messageId,
}: ExportsHookProps<{ quizType: "exit" | "starter" }>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const query = trpc.exports.exportQuizDoc.useMutation();
  const quiz = quizType === "exit" ? lesson.exitQuiz : lesson.starterQuiz;
  const [parseResult, setParseResult] = useState<
    { data?: QuizDocInputData; success: boolean; error?: ZodError } | undefined
  >({ success: false });
  const debouncedParseResult = useDebounce(parseResult, 500);

  useEffect(() => {
    const inputData = {
      quiz,
      quizType,
      lessonTitle: lesson.title,
    };
    if (active) {
      const res = exportDocQuizSchema.safeParse(inputData);
      setParseResult(res);
    }
  }, [setParseResult, active, lesson, quizType, quiz]);

  const checkForSnapShotAndPreloadQuery =
    trpc.exports.checkIfQuizDownloadExists.useMutation();
  const [checked, setChecked] = useState(false);
  const check = useCallback(async () => {
    if (
      debouncedParseResult?.success &&
      debouncedParseResult.data &&
      !checked
    ) {
      try {
        checkForSnapShotAndPreloadQuery.mutate({
          chatId,
          lessonSnapshot: lesson,
          data: debouncedParseResult.data,
        });
        setChecked(true);
      } catch (error) {
        console.error("Error during check:", error);
      }
    }
  }, [
    lesson,
    debouncedParseResult?.success,
    debouncedParseResult?.data,
    chatId,
    checkForSnapShotAndPreloadQuery,
    checked,
  ]);

  useEffect(() => {
    check();
  }, [check]);

  const start = useCallback(() => {
    if (!active) {
      return;
    }
    if (!messageId) {
      Sentry.captureException(
        new Error("Failed to start export: messageId is undefined"),
        {
          extra: {
            chatId,
            lesson,
          },
        },
      );
      return;
    }

    if (!debouncedParseResult?.success) {
      Sentry.captureException(
        new Error("Invalid lesson plan data in useExportQuizDoc"),
        {
          extra: {
            lesson,
            zodError: debouncedParseResult?.error,
          },
        },
      );
    } else if (debouncedParseResult.data) {
      query.mutate({
        data: debouncedParseResult.data,
        lessonSnapshot: lesson,
        chatId,
        messageId,
      });
      onStart();
      setDialogOpen(true);
    }
  }, [active, debouncedParseResult, lesson, onStart, query, chatId, messageId]);

  const closeDialog = useCallback(() => setDialogOpen(false), []);

  const objectToReturn = useMemo(
    () => ({
      readyToExport: active && debouncedParseResult?.success === true,
      start,
      dialogOpen,
      closeDialog,
      status: query.status,
      data: checkForSnapShotAndPreloadQuery.data || query.data,
    }),
    [
      checkForSnapShotAndPreloadQuery.data,
      active,
      debouncedParseResult,
      dialogOpen,
      query.status,
      query.data,
      start,
      closeDialog,
    ],
  );

  return objectToReturn;
}

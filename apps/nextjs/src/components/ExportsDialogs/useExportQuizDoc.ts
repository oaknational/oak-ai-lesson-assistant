import { useCallback, useEffect, useMemo, useState } from "react";

import { exportDocQuizSchema } from "@oakai/exports/browser";
import type {
  LessonDeepPartial,
  QuizDocInputData,
} from "@oakai/exports/src/schema/input.schema";
import * as Sentry from "@sentry/nextjs";
import { useDebounce } from "@uidotdev/usehooks";
import type { ZodError } from "zod";

import { trpc } from "@/utils/trpc";

import type { ExportsHookProps } from "./exports.types";
import { useExportsExistenceCheck } from "./useExportsExistenceCheck";

function extractQuizFromLesson(
  lesson: LessonDeepPartial,
  quizType: "exit" | "starter",
) {
  switch (quizType) {
    case "starter":
      return lesson._experimental_starterQuizMathsV0 ?? lesson.starterQuiz;
    case "exit":
      return lesson._experimental_exitQuizMathsV0 ?? lesson.exitQuiz;
  }
}

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
  const quiz = extractQuizFromLesson(lesson, quizType);
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
  const checkFn = useCallback(
    (
      args: Omit<
        Parameters<typeof checkForSnapShotAndPreloadQuery.mutate>[0],
        "lessonSnapshot"
      >,
    ) =>
      checkForSnapShotAndPreloadQuery.mutate({
        ...args,
        lessonSnapshot: lesson,
      }),
    [lesson, checkForSnapShotAndPreloadQuery],
  );
  const check = useExportsExistenceCheck({
    success: debouncedParseResult?.success,
    data: debouncedParseResult?.data,
    chatId,
    messageId,
    checkFn,
  });

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

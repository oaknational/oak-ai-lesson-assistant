import { useCallback, useEffect, useMemo, useState } from "react";

import { LessonDeepPartial, exportDocQuizSchema } from "@oakai/exports/browser";
import { QuizDocInputData } from "@oakai/exports/src/schema/input.schema";
import * as Sentry from "@sentry/nextjs";
import { useDebounce } from "@uidotdev/usehooks";
import { ZodError } from "zod";

import { trpc } from "@/utils/trpc";

export function useExportQuizDoc({
  onStart,
  quizType,
  lesson,
  active,
  chatId,
  messageId,
}: {
  onStart: () => void;
  quizType: "exit" | "starter";
  lesson: LessonDeepPartial;
  chatId: string;
  messageId: number;
  active: boolean;
}) {
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

  const start = useCallback(() => {
    if (!active) {
      return;
    }
    console.log("STARTING");

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
        messageId: messageId.toString(),
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
      data: query.data,
    }),
    [
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

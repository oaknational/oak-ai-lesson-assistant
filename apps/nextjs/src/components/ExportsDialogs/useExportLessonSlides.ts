import { useCallback, useEffect, useMemo, useState } from "react";

import {
  LessonDeepPartial,
  exportSlidesFullLessonSchema,
} from "@oakai/exports/browser";
import { LessonSlidesInputData } from "@oakai/exports/src/schema/input.schema";
import * as Sentry from "@sentry/nextjs";
import { useDebounce } from "@uidotdev/usehooks";
import { ZodError } from "zod";

import { trpc } from "@/utils/trpc";

export function useExportLessonSlides({
  onStart,
  lesson,
  chatId,
  messageId,
  active,
}: {
  onStart: () => void;
  lesson: LessonDeepPartial;
  chatId: string;
  messageId: number;
  active: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const query = trpc.exports.exportLessonSlides.useMutation();

  const [parseResult, setParseResult] = useState<
    | { data?: LessonSlidesInputData; success: boolean; error?: ZodError }
    | undefined
  >({ success: false });
  const debouncedParseResult = useDebounce(parseResult, 500);

  useEffect(() => {
    console.log("Use Export Lesson Slides");
    if (active) {
      const res = exportSlidesFullLessonSchema.safeParse(lesson);
      setParseResult(res);
    }
  }, [lesson, setParseResult, active]);

  const checkForSnapShotAndPreloadQuery =
    trpc.exports.checkIfSlideDownloadExists.useMutation();
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
          data: debouncedParseResult.data,
        });
        setChecked(true);
      } catch (error) {
        console.error("Error during check:", error);
      }
    }
  }, [
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
    console.log("STARTING");

    if (!debouncedParseResult?.success) {
      Sentry.captureException(
        new Error("Invalid lesson plan data in useExportLessonSlides"),
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
      data: checkForSnapShotAndPreloadQuery.data || query.data,
    }),
    [
      active,
      debouncedParseResult,
      dialogOpen,
      query.status,
      query.data,
      checkForSnapShotAndPreloadQuery.data,
      start,
      closeDialog,
    ],
  );

  return objectToReturn;
}

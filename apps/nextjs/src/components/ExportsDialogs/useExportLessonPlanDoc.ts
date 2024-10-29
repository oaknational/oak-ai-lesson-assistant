import { useCallback, useEffect, useMemo, useState } from "react";

import { exportDocLessonPlanSchema } from "@oakai/exports/browser";
import type { LessonPlanDocInputData } from "@oakai/exports/src/schema/input.schema";
import * as Sentry from "@sentry/nextjs";
import { useDebounce } from "@uidotdev/usehooks";
import type { ZodError } from "zod";

import { trpc } from "@/utils/trpc";

import type { ExportsHookProps } from "./exports.types";
import { useExportsExistenceCheck } from "./useExportsExistenceCheck";

export function useExportLessonPlanDoc({
  onStart,
  lesson,
  active,
  chatId,
  messageId,
}: ExportsHookProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const query = trpc.exports.exportLessonPlanDoc.useMutation();

  const [parseResult, setParseResult] = useState<
    | { data?: LessonPlanDocInputData; success: boolean; error?: ZodError }
    | undefined
  >({ success: false });
  const debouncedParseResult = useDebounce(parseResult, 500);

  useEffect(() => {
    if (active) {
      const res = exportDocLessonPlanSchema.safeParse(lesson);
      setParseResult(res);
    }
  }, [lesson, setParseResult, active]);

  const checkForSnapShotAndPreloadQuery =
    trpc.exports.checkIfLessonPlanDownloadExists.useMutation();
  const check = useExportsExistenceCheck({
    success: debouncedParseResult?.success,
    data: debouncedParseResult?.data,
    chatId,
    messageId,
    checkFn: checkForSnapShotAndPreloadQuery.mutate,
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
        new Error("Invalid lesson plan data in useExportLessonPlanDoc"),
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

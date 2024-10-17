import { useCallback, useEffect, useMemo, useState } from "react";

import {
  LessonDeepPartial,
  exportSlidesFullLessonSchema,
} from "@oakai/exports/browser";
import { LessonSlidesInputData } from "@oakai/exports/src/schema/input.schema";
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";
import { useDebounce } from "@uidotdev/usehooks";
import { ZodError } from "zod";

import { trpc } from "@/utils/trpc";

const log = aiLogger("exports");

export function useExportAllLessonAssets({
  onStart,
  lesson,
  chatId,
  messageId,
  active,
}: {
  onStart: () => void;
  lesson: LessonDeepPartial;
  chatId: string;
  messageId: string | undefined;
  active: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const query = trpc.exports.generateAllAssetExports.useMutation();

  const [parseResult, setParseResult] = useState<
    | { data?: LessonSlidesInputData; success: boolean; error?: ZodError }
    | undefined
  >({ success: false });
  const debouncedParseResult = useDebounce(parseResult, 500);

  useEffect(() => {
    if (active) {
      const res = exportSlidesFullLessonSchema.safeParse(lesson);
      setParseResult(res);
    }
  }, [lesson, setParseResult, active]);

  const start = useCallback(() => {
    if (!active) {
      return;
    }
    log.info("STARTING");

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
      if (!messageId) {
        throw new Error("messageId is undefined");
      }
      query.mutate({
        data: debouncedParseResult.data,
        chatId,
        messageId: messageId,
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

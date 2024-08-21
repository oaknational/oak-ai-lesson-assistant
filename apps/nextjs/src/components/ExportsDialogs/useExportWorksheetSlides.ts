import { useCallback, useEffect, useMemo, useState } from "react";

import {
  LessonDeepPartial,
  exportSlidesWorksheetSchema,
} from "@oakai/exports/browser";
import { WorksheetSlidesInputData } from "@oakai/exports/src/schema/input.schema";
import * as Sentry from "@sentry/nextjs";
import { useDebounce } from "@uidotdev/usehooks";
import { ZodError } from "zod";

import { trpc } from "@/utils/trpc";

export function useExportWorksheetSlides({
  onStart,
  lesson,
  active,
  chatId,
  messageId,
}: {
  onStart: () => void;
  lesson: LessonDeepPartial;
  chatId: string;
  messageId: number;
  active: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const query = trpc.exports.exportWorksheetDocs.useMutation();

  const [parseResult, setParseResult] = useState<
    | { data?: WorksheetSlidesInputData; success: boolean; error?: ZodError }
    | undefined
  >({ success: false });
  const debouncedParseResult = useDebounce(parseResult, 500);

  useEffect(() => {
    if (active) {
      const res = exportSlidesWorksheetSchema.safeParse(lesson);
      setParseResult(res);
    }
  }, [lesson, setParseResult, active]);

  const start = useCallback(() => {
    if (!active) {
      return;
    }

    if (!debouncedParseResult?.success) {
      Sentry.captureException(
        new Error("Invalid lesson plan data in useExportWorksheetSlides"),
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

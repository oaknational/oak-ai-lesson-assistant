import { useEffect, useState } from "react";

import type { ExportableQuizAppState } from "@oakai/exports/src/schema/input.schema";
import { exportableQuizAppStateSchema } from "@oakai/exports/src/schema/input.schema";
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";
import { useDebounce } from "@uidotdev/usehooks";
import type { ZodError } from "zod";

import { trpc } from "@/utils/trpc";

const log = aiLogger("exports");

export function useExportQuizDesignerSlides({
  onStart,
  quiz,
  quizId,
  active,
}: {
  onStart: () => void;
  quiz: ExportableQuizAppState;
  quizId: string;
  active: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const query = trpc.exports.exportQuizDesignerSlides.useMutation();

  const [parseResult, setParseResult] = useState<
    | { data?: ExportableQuizAppState; success: boolean; error?: ZodError }
    | undefined
  >({ success: false });

  const debouncedParseResult = useDebounce(parseResult, 500);

  useEffect(() => {
    if (active) {
      const res = exportableQuizAppStateSchema.safeParse(quiz);
      setParseResult(res);
    }
  }, [quiz, setParseResult, active]);

  return {
    readyToExport: active && debouncedParseResult?.success === true,
    start: () => {
      if (!active) {
        return;
      }

      log.info("STARTING");

      if (!debouncedParseResult?.success) {
        Sentry.captureException(
          new Error("Invalid lesson plan data in useExportLessonSlides"),
          {
            extra: {
              lesson: quiz,
              zodError: debouncedParseResult?.error,
            },
          },
        );
      } else if (debouncedParseResult.data) {
        query.mutate({
          data: debouncedParseResult.data,
          chatId: quizId,
          messageId: "messageId.toString()",
        });
        onStart();
        setDialogOpen(true);
      }
    },
    dialogOpen,
    closeDialog: () => setDialogOpen(false),
    status: query.status,
    data: query.data,
  };
}

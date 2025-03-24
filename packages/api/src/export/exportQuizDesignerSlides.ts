import type { PrismaClientWithAccelerate } from "@oakai/db";
import { exportQuizDesignerSlides } from "@oakai/exports";
import type { ExportableQuizAppState } from "@oakai/exports/src/schema/input.schema";
import { aiLogger } from "@oakai/logger";

import type { SignedInAuthObject } from "@clerk/backend/internal";
import * as Sentry from "@sentry/nextjs";

import type { OutputSchema } from "../router/exports";
import { qdSaveExport, reportErrorResult } from "../router/exports";
import { getExistingExportData, getUserEmail } from "./exportHelpers";

const log = aiLogger("exports");

export async function exportQuizDesignerSlidesWrapper({
  input,
  ctx,
}: {
  input: {
    data: ExportableQuizAppState;
    chatId: string;
    messageId: string;
  };
  ctx: {
    auth: SignedInAuthObject;
    prisma: PrismaClientWithAccelerate;
  };
}) {
  const userEmail = await getUserEmail(ctx);
  if (!userEmail) {
    return {
      error: new Error("User email not found"),
      message: "User email not found",
    };
  }
  const exportType = "LESSON_SLIDES_SLIDES";

  const { exportData, lessonSnapshot } = await getExistingExportData({
    ctx,
    input,
    exportType,
  });

  if (exportData) {
    return exportData;
  }

  /**
   * User hasn't yet exported the lesson in this state, so we'll do it now
   * and store the result in the database
   */

  const result = await exportQuizDesignerSlides({
    snapshotId: "lessonSnapshot.id",
    userEmail,
    onStateChange: (state) => {
      log.info(state);

      Sentry.addBreadcrumb({
        category: "exportWorksheetSlides",
        message: "Export state change",
        data: state,
      });
    },
    quiz: input.data,
  });

  Sentry.addBreadcrumb({
    category: "exportLessonSlides",
    message: "Got export result",
    data: { result },
  });

  if ("error" in result) {
    reportErrorResult(result, input);
    return {
      error: result.error,
      message: "Failed to export lesson",
    };
  }

  const { data } = result;

  await qdSaveExport({
    auth: ctx.auth,
    prisma: ctx.prisma,
    snapshotId: lessonSnapshot.id,
    exportType,
    data: result.data,
  });

  const output: OutputSchema = {
    link: data.fileUrl,
    canViewSourceDoc: data.userCanViewGdriveFile,
  };
  return output;
}

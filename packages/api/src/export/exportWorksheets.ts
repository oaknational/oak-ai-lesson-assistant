import type { SignedInAuthObject } from "@clerk/backend/internal";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { exportDocsWorksheet } from "@oakai/exports";
import type { WorksheetSlidesInputData } from "@oakai/exports/src/schema/input.schema";
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";

import type { OutputSchema } from "../router/exports";
import { ailaSaveExport, reportErrorResult } from "../router/exports";
import { getExistingExportData, getUserEmail } from "./exportHelpers";

const log = aiLogger("exports");

export async function exportWorksheets({
  input,
  ctx,
}: {
  input: {
    data: WorksheetSlidesInputData;
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
  const exportType = "WORKSHEET_SLIDES";

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
  const result = await exportDocsWorksheet({
    snapshotId: lessonSnapshot.id,
    userEmail,
    onStateChange: (state) => {
      log.info(state);

      Sentry.addBreadcrumb({
        category: "exportWorksheetDocs",
        message: "Export state change",
        data: state,
      });
    },
    data: input.data,
  });

  Sentry.addBreadcrumb({
    category: "exportWorksheetDocs",
    message: "Got export result",
    data: { result },
  });

  if ("error" in result) {
    reportErrorResult(result, input);
    return {
      error: result.error,
      message: "Failed to export worksheet",
    };
  }

  const { data } = result;

  await ailaSaveExport({
    auth: ctx.auth,
    prisma: ctx.prisma,
    lessonSnapshotId: lessonSnapshot.id,
    exportType,
    data,
  });

  const output: OutputSchema = {
    link: data.fileUrl,
    canViewSourceDoc: data.userCanViewGdriveFile,
  };
  return output;
}

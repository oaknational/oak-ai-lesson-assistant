import { SignedInAuthObject } from "@clerk/backend/internal";
import { clerkClient } from "@clerk/nextjs/server";
import { PrismaClientWithAccelerate } from "@oakai/db";
import { exportDocsWorksheet } from "@oakai/exports";
import { WorksheetSlidesInputData } from "@oakai/exports/src/schema/input.schema";
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";

import {
  ailaGetExportBySnapshotId,
  ailaGetOrSaveSnapshot,
  ailaSaveExport,
  OutputSchema,
  reportErrorResult,
} from "../router/exports";

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
  const user = await clerkClient.users.getUser(ctx.auth.userId);
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  const exportType = "WORKSHEET_SLIDES";

  if (!userEmail) {
    return {
      error: new Error("User email not found"),
      message: "User email not found",
    };
  }

  const lessonSnapshot = await ailaGetOrSaveSnapshot({
    prisma: ctx.prisma,
    userId: ctx.auth.userId,
    chatId: input.chatId,
    messageId: input.messageId,
    snapshot: input.data,
  });

  Sentry.addBreadcrumb({
    category: "exportWorksheetDocs",
    message: "Got or saved snapshot",
    data: { lessonSnapshot },
  });

  const exportData = await ailaGetExportBySnapshotId({
    prisma: ctx.prisma,
    snapshotId: lessonSnapshot.id,
    exportType,
  });

  Sentry.addBreadcrumb({
    category: "exportWorksheetDocs",
    message: "Got export data",
    data: { exportData },
  });

  if (exportData) {
    const output: OutputSchema = {
      link: exportData.gdriveFileUrl,
      canViewSourceDoc: exportData.userCanViewGdriveFile,
    };
    return output;
  }

  /**
   * User hasn't yet exported the lesson in this state, so we'll do it now
   * and store the result in the database
   */
  const result = await exportDocsWorksheet({
    snapshotId: lessonSnapshot.id,
    userEmail,
    onStateChange: (state) => {
      log(state);

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

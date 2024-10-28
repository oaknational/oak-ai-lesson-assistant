import { SignedInAuthObject } from "@clerk/backend/internal";
import { clerkClient } from "@clerk/nextjs/server";
import { LessonSnapshots } from "@oakai/core";
import { PrismaClientWithAccelerate } from "@oakai/db";
import { exportAdditionalMaterials } from "@oakai/exports";
import { LessonSlidesInputData } from "@oakai/exports/src/schema/input.schema";
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";

import {
  ailaGetExportBySnapshotId,
  ailaSaveExport,
  OutputSchema,
  reportErrorResult,
} from "../router/exports";

const log = aiLogger("exports");

export async function exportAdditionalMaterialsDoc({
  input,
  ctx,
}: {
  input: {
    data: LessonSlidesInputData;
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
  const exportType = "ADDITIONAL_MATERIALS_DOCS";

  if (!userEmail) {
    return {
      error: new Error("User email not found"),
      message: "User email not found",
    };
  }

  const lessonSnapshots = new LessonSnapshots(ctx.prisma);
  const lessonSnapshot = await lessonSnapshots.getOrSaveSnapshot({
    userId: ctx.auth.userId,
    chatId: input.chatId,
    messageId: input.messageId,
    snapshot: input.data,
    trigger: "EXPORT_BY_USER",
  });

  Sentry.addBreadcrumb({
    category: "exportAdditionalMaterialsDoc",
    message: "Got or saved snapshot",
    data: { lessonSnapshot },
  });

  const exportData = await ailaGetExportBySnapshotId({
    prisma: ctx.prisma,
    snapshotId: lessonSnapshot.id,
    exportType,
  });

  Sentry.addBreadcrumb({
    category: "exportAdditionalMaterialsDoc",
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

  const result = await exportAdditionalMaterials({
    snapshotId: lessonSnapshot.id,
    userEmail,
    onStateChange: (state) => {
      log.info(state);

      Sentry.addBreadcrumb({
        category: "exportAdditionalMaterialsDoc",
        message: "Export state change",
        data: state,
      });
    },
    lesson: input.data,
  });

  Sentry.addBreadcrumb({
    category: "exportAdditionalMaterialsDoc",
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

import type { SignedInAuthObject } from "@clerk/backend/internal";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { exportAdditionalMaterials } from "@oakai/exports";
import type { LessonSlidesInputData } from "@oakai/exports/src/schema/input.schema";
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";

import type { OutputSchema } from "../router/exports";
import { ailaSaveExport, reportErrorResult } from "../router/exports";
import {
  getExportData,
  getLessonSnapshot,
  getUserEmail,
} from "./exportHelpers";

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
  const userEmail = await getUserEmail(ctx);
  if (!userEmail) {
    return {
      error: new Error("User email not found"),
      message: "User email not found",
    };
  }
  const exportType = "ADDITIONAL_MATERIALS_DOCS";

  const lessonSnapshot = await getLessonSnapshot<LessonSlidesInputData>({
    ctx,
    input,
    exportType,
  });

  const exportData = await getExportData({
    prisma: ctx.prisma,
    snapshotId: lessonSnapshot.id,
    exportType,
  });

  if (exportData) {
    return;
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

import type { SignedInAuthObject } from "@clerk/backend/internal";
import { clerkClient } from "@clerk/nextjs/server";
import { LessonSnapshots } from "@oakai/core";
import type { Snapshot } from "@oakai/core/src/models/lessonSnapshots";
import type {
  LessonExportType,
  LessonSnapshot,
  PrismaClientWithAccelerate,
} from "@oakai/db";
import * as Sentry from "@sentry/nextjs";

import {
  ailaGetExportBySnapshotId,
  type OutputSchema,
} from "../router/exports";

export const getUserEmail = async (ctx: {
  auth: SignedInAuthObject;
  prisma: PrismaClientWithAccelerate;
}) => {
  const user = await clerkClient.users.getUser(ctx.auth.userId);
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  return userEmail;
};

const categoryMap: Record<string, string> = {
  LESSON_SLIDES_SLIDES: "exportLessonSlidesDoc",
  LESSON_PLAN_DOC: "exportLessonPlanDoc",
  WORKSHEET_SLIDES: "exportWorksheetDocs",
  ADDITIONAL_MATERIALS_DOCS: "exportAdditionalMaterialsDoc",
  EXIT_QUIZ_DOC: "exportQuizDoc",
  STARTER_QUIZ_DOC: "exportQuizDoc",
};

export const getLessonSnapshot = async <T>({
  input,
  ctx,
  exportType,
}: {
  input: {
    data: T;
    chatId: string;
    messageId: string;
  };
  ctx: {
    auth: SignedInAuthObject;
    prisma: PrismaClientWithAccelerate;
  };
  exportType: LessonExportType;
}): Promise<LessonSnapshot> => {
  const lessonSnapshots = new LessonSnapshots(ctx.prisma);

  const lessonSnapshot = await lessonSnapshots.getOrSaveSnapshot({
    userId: ctx.auth.userId,
    chatId: input.chatId,
    messageId: input.messageId,
    snapshot: input.data as Snapshot,
    trigger: "EXPORT_BY_USER",
  });

  const category = categoryMap[exportType] ?? "exportLessonDoc";

  Sentry.addBreadcrumb({
    category,
    message: "Got or saved snapshot",
    data: { lessonSnapshot },
  });

  return lessonSnapshot;
};

export const getExportData = async ({
  prisma,
  snapshotId,
  exportType,
}: {
  prisma: PrismaClientWithAccelerate;
  snapshotId: string;
  exportType: LessonExportType;
}) => {
  const exportData = await ailaGetExportBySnapshotId({
    prisma,
    snapshotId,
    exportType,
  });
  const category = categoryMap[exportType] ?? "exportLessonDoc";
  Sentry.addBreadcrumb({
    category,
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
};

export const getExistingExportData = async <T>({
  input,
  ctx,
  exportType,
}: {
  input: {
    data: T;
    chatId: string;
    messageId: string;
  };
  ctx: {
    auth: SignedInAuthObject;
    prisma: PrismaClientWithAccelerate;
  };
  exportType: LessonExportType;
}) => {
  const lessonSnapshot = await getLessonSnapshot<T>({
    ctx,
    input,
    exportType,
  });

  const exportData = await getExportData({
    prisma: ctx.prisma,
    snapshotId: lessonSnapshot.id,
    exportType,
  });

  return { exportData, lessonSnapshot };
};

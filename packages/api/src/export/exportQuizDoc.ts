import type { SignedInAuthObject } from "@clerk/backend/internal";
import { clerkClient } from "@clerk/nextjs/server";
import { LessonSnapshots } from "@oakai/core";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { exportDocQuiz } from "@oakai/exports";
import type { QuizDocInputData } from "@oakai/exports/src/schema/input.schema";
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import type {
  OutputSchema} from "../router/exports";
import {
  ailaGetExportBySnapshotId,
  ailaSaveExport,
  reportErrorResult,
} from "../router/exports";

const log = aiLogger("exports");

const lessonSnapshotSchema = z.object({}).passthrough();

type LessonSnapshot = z.infer<typeof lessonSnapshotSchema>;

export async function exportQuizDoc({
  ctx,
  input,
}: {
  ctx: {
    auth: SignedInAuthObject;
    prisma: PrismaClientWithAccelerate;
  };
  input: {
    chatId: string;
    messageId: string;
    lessonSnapshot: LessonSnapshot;
    data: QuizDocInputData;
  };
}) {
  const user = await clerkClient.users.getUser(ctx.auth.userId);
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  const exportType =
    input.data.quizType === "exit" ? "EXIT_QUIZ_DOC" : "STARTER_QUIZ_DOC";

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
    snapshot: input.lessonSnapshot,
    trigger: "EXPORT_BY_USER",
  });

  Sentry.addBreadcrumb({
    category: "exportQuizDoc",
    message: "Got or saved snapshot",
    data: { lessonSnapshot },
  });

  const exportData = await ailaGetExportBySnapshotId({
    prisma: ctx.prisma,
    snapshotId: lessonSnapshot.id,
    exportType,
  });

  Sentry.addBreadcrumb({
    category: "exportQuizDoc",
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
  const result = await exportDocQuiz({
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
    category: "exportQuizDoc",
    message: "Got export result",
    data: { result },
  });

  if ("error" in result) {
    reportErrorResult(result, input);
    return {
      error: result.error,
      message: "Failed to export quiz",
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

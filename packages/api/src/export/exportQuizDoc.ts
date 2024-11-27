import type { SignedInAuthObject } from "@clerk/backend/internal";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { exportDocQuiz } from "@oakai/exports";
import type { QuizDocInputData } from "@oakai/exports/src/schema/input.schema";
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import type { OutputSchema } from "../router/exports";
import { ailaSaveExport, reportErrorResult } from "../router/exports";
import {
  getExportData,
  getLessonSnapshot,
  getUserEmail,
} from "./exportHelpers";

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
  const userEmail = await getUserEmail(ctx);
  if (!userEmail) {
    return {
      error: new Error("User email not found"),
      message: "User email not found",
    };
  }

  const exportType =
    input.data.quizType === "exit" ? "EXIT_QUIZ_DOC" : "STARTER_QUIZ_DOC";

  const lessonSnapshot = await getLessonSnapshot<QuizDocInputData>({
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

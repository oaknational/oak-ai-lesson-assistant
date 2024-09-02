import { SignedInAuthObject } from "@clerk/backend/internal";
import { clerkClient } from "@clerk/nextjs/server";
import { sendEmail } from "@oakai/core/src/utils/sendEmail";
import { PrismaClientWithAccelerate } from "@oakai/db";
import {
  LessonDeepPartial,
  exportAdditionalMaterials,
  exportDocLessonPlan,
  exportDocLessonPlanSchema,
  exportDocQuiz,
  exportDocQuizSchema,
  exportDocsWorksheet,
  exportSlidesFullLesson,
  exportSlidesFullLessonSchema,
  exportDocsWorksheetSchema,
  exportQuizDesignerSlides,
} from "@oakai/exports";
import {
  ExportableQuizAppState,
  exportableQuizAppStateSchema,
} from "@oakai/exports/src/schema/input.schema";
import { DeepPartial } from "@oakai/exports/src/types";
import { LessonExportType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { kv } from "@vercel/kv";
import crypto from "crypto";
import { z } from "zod";

import { LessonPlanJsonSchema } from "../../../aila/src/protocol/schema";
import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

const JsonSchemaString = JSON.stringify(LessonPlanJsonSchema);

const LESSON_JSON_SCHEMA_HASH = crypto
  .createHash("sha256")
  .update(JsonSchemaString)
  .digest("hex");

function getSnapshotHash(snapshot: LessonDeepPartial) {
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(snapshot))
    .digest("hex");

  return hash;
}

async function ailaGetOrSaveSnapshot({
  prisma,
  userId,
  chatId,
  messageId,
  snapshot,
}: {
  prisma: Pick<PrismaClientWithAccelerate, "lessonSchema" | "lessonSnapshot">;
  userId: string;
  chatId: string;
  messageId: string;
  snapshot: LessonDeepPartial;
}) {
  /**
   * Prisma types complained when passing the JSON schema directly to the Prisma
   */
  const jsonSchema = JSON.parse(JsonSchemaString);
  // get latest lesson schema for given hash
  let lessonSchema = await prisma.lessonSchema.findFirst({
    where: {
      hash: LESSON_JSON_SCHEMA_HASH,
    },
    orderBy: {
      createdAt: "desc",
    },
    cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
  });

  if (!lessonSchema) {
    // create lesson schema if not found
    lessonSchema = await prisma.lessonSchema.create({
      data: {
        hash: LESSON_JSON_SCHEMA_HASH,
        jsonSchema,
      },
    });
  }

  const hash = getSnapshotHash(snapshot);

  // attempt to find existing snapshot
  const existingSnapshot = await prisma.lessonSnapshot.findFirst({
    where: {
      userId,
      chatId,
      hash,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existingSnapshot) {
    return existingSnapshot;
  }

  const lessonJson = JSON.stringify(snapshot);

  const lessonSnapshot = await prisma.lessonSnapshot.create({
    data: {
      userId,
      chatId,
      messageId,
      lessonSchemaId: lessonSchema.id,
      hash,
      lessonJson,
      trigger: "EXPORT_BY_USER",
    },
  });

  return lessonSnapshot;
}

async function qdGetOrSaveSnapshot({
  prisma,
  userId,
  sessionId,
  messageId,
  snapshot,
}: {
  prisma: PrismaClientWithAccelerate;
  userId: string;
  sessionId: string;
  messageId: string;
  snapshot: DeepPartial<ExportableQuizAppState>;
}) {
  /**
   * Prisma types complained when passing the JSON schema directly to the Prisma
   */

  const hash = getSnapshotHash(snapshot);

  // attempt to find existing snapshot
  const existingSnapshot = await prisma.qdSnapshot.findFirst({
    where: {
      userId,
      sessionId,
      hash,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existingSnapshot) {
    return existingSnapshot;
  }

  const lessonSnapshot = await prisma.qdSnapshot.create({
    data: {
      userId,
      sessionId,
      messageId,
      hash,
      qdJson: JSON.stringify(snapshot),
      trigger: "EXPORT_BY_USER",
    },
  });

  return lessonSnapshot;
}

async function ailaSaveExport({
  auth,
  prisma,
  lessonSnapshotId,
  exportType,
  data,
}: {
  auth: Pick<SignedInAuthObject, "userId">;
  prisma: Pick<PrismaClientWithAccelerate, "lessonExport">;
  lessonSnapshotId: string;
  exportType: LessonExportType;
  data: {
    templateId: string;
    fileId: string;
    fileUrl: string;
    userCanViewGdriveFile: boolean;
  };
}) {
  await prisma.lessonExport.create({
    data: {
      lessonSnapshotId,
      exportType,
      templateGdriveFileId: data.templateId,
      gdriveFileId: data.fileId,
      gdriveFileUrl: data.fileUrl,
      userCanViewGdriveFile: data.userCanViewGdriveFile,
      userId: auth.userId,
    },
  });
}

async function qdSaveExport({
  auth,
  prisma,
  snapshotId,
  exportType,
  data,
}: {
  auth: Pick<SignedInAuthObject, "userId">;
  prisma: Pick<PrismaClientWithAccelerate, "qdExport">;
  snapshotId: string;
  exportType: LessonExportType;
  data: {
    templateId: string;
    fileId: string;
    fileUrl: string;
    userCanViewGdriveFile: boolean;
  };
}) {
  await prisma.qdExport.create({
    data: {
      snapshotId,
      exportType,
      templateGdriveFileId: data.templateId,
      gdriveFileId: data.fileId,
      gdriveFileUrl: data.fileUrl,
      userCanViewGdriveFile: data.userCanViewGdriveFile,
      userId: auth.userId,
    },
  });
}

async function ailaGetExportBySnapshotId({
  prisma,
  snapshotId,
  exportType,
}: {
  prisma: Pick<PrismaClientWithAccelerate, "lessonExport">;
  snapshotId: string;
  exportType: LessonExportType;
}) {
  const exportData = await prisma.lessonExport.findFirst({
    where: {
      lessonSnapshotId: snapshotId,
      exportType,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return exportData;
}

async function qdGetExportBySnapshotId({
  prisma,
  snapshotId,
  exportType,
}: {
  prisma: PrismaClientWithAccelerate;
  snapshotId: string;
  exportType: LessonExportType;
}) {
  const exportData = await prisma.qdExport.findFirst({
    where: {
      snapshotId: snapshotId,
      exportType,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return exportData;
}

const reportErrorResult = (
  result: { error: unknown; message: string },
  extra: object,
) => {
  Sentry.captureException(result.error, {
    extra: {
      ...extra,
      error: result.error,
      message: result.message,
    },
  });
};

const outputSchema = z.union([
  z.object({ link: z.string(), canViewSourceDoc: z.boolean() }),
  z.object({ error: z.unknown(), message: z.string() }),
]);
type OutputSchema = z.infer<typeof outputSchema>;

/**
 * @todo refactor this router to for less duplication
 */
export const exportsRouter = router({
  exportLessonSlides: protectedProcedure
    .input(
      z.object({
        data: exportSlidesFullLessonSchema.passthrough(),
        chatId: z.string(),
        messageId: z.string(),
      }),
    )
    .output(outputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await clerkClient.users.getUser(ctx.auth.userId);
        const userEmail = user?.emailAddresses[0]?.emailAddress;
        const exportType = "LESSON_SLIDES_SLIDES";

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
          category: "exportLessonSlides",
          message: "Got or saved snapshot",
          data: { lessonSnapshot },
        });

        const exportData = await ailaGetExportBySnapshotId({
          prisma: ctx.prisma,
          snapshotId: lessonSnapshot.id,
          exportType,
        });

        Sentry.addBreadcrumb({
          category: "exportLessonSlides",
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

        const result = await exportSlidesFullLesson({
          snapshotId: lessonSnapshot.id,
          userEmail,
          onStateChange: (state) => {
            console.log(state);

            Sentry.addBreadcrumb({
              category: "exportWorksheetDocs",
              message: "Export state change",
              data: state,
            });
          },
          lesson: input.data,
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
      } catch (error) {
        const message = "Failed to export lesson";
        reportErrorResult({ error, message }, input);
        return {
          error,
          message,
        };
      }
    }),

  exportQuizDesignerSlides: protectedProcedure
    .input(
      z.object({
        data: exportableQuizAppStateSchema.passthrough(),
        chatId: z.string(),
        messageId: z.string(),
      }),
    )
    .output(outputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await clerkClient.users.getUser(ctx.auth.userId);
        const userEmail = user?.emailAddresses[0]?.emailAddress;
        const exportType = "LESSON_SLIDES_SLIDES";

        if (!userEmail) {
          return {
            error: new Error("User email not found"),
            message: "User email not found",
          };
        }

        const qdSnapshot = await qdGetOrSaveSnapshot({
          prisma: ctx.prisma,
          userId: ctx.auth.userId,
          sessionId: input.chatId,
          messageId: input.messageId,
          snapshot: input.data,
        });

        Sentry.addBreadcrumb({
          category: "exportQuizDesignerSlides",
          message: "Got or saved snapshot",
          data: { qdSnapshot },
        });

        const exportData = await qdGetExportBySnapshotId({
          prisma: ctx.prisma,
          snapshotId: qdSnapshot.id,
          exportType,
        });

        Sentry.addBreadcrumb({
          category: "exportQuizDesignerSlides",
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

        const result = await exportQuizDesignerSlides({
          snapshotId: "lessonSnapshot.id",
          userEmail,
          onStateChange: (state) => {
            console.log(state);

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
          snapshotId: qdSnapshot.id,
          exportType,
          data,
        });

        const output: OutputSchema = {
          link: data.fileUrl,
          canViewSourceDoc: data.userCanViewGdriveFile,
        };
        return output;
      } catch (error) {
        const message = "Failed to export lesson";
        reportErrorResult({ error, message }, input);
        return {
          error,
          message,
        };
      }
    }),

  exportAdditionalMaterialsDoc: protectedProcedure
    .input(
      z.object({
        data: exportDocLessonPlanSchema.passthrough(),
        chatId: z.string(),
        messageId: z.string(),
      }),
    )
    .output(outputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await clerkClient.users.getUser(ctx.auth.userId);
        const userEmail = user?.emailAddresses[0]?.emailAddress;
        const exportType = "ADDITIONAL_MATERIALS_DOCS";

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
            console.log(state);

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
      } catch (error) {
        const message = "Failed to export lesson";
        reportErrorResult({ error, message }, input);
        return {
          error,
          message,
        };
      }
    }),

  exportWorksheetDocs: protectedProcedure
    .input(
      z.object({
        data: exportDocsWorksheetSchema.passthrough(),
        chatId: z.string(),
        messageId: z.string(),
      }),
    )
    .output(outputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
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
            console.log(state);

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
      } catch (error) {
        const message = "Failed to export worksheet";
        reportErrorResult({ error, message }, input);
        return {
          error,
          message,
        };
      }
    }),
  exportQuizDoc: protectedProcedure
    .input(
      z.object({
        data: exportDocQuizSchema.passthrough(),
        lessonSnapshot: z.object({}).passthrough(),
        chatId: z.string(),
        messageId: z.string(),
      }),
    )
    .output(outputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
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

        const lessonSnapshot = await ailaGetOrSaveSnapshot({
          prisma: ctx.prisma,
          userId: ctx.auth.userId,
          chatId: input.chatId,
          messageId: input.messageId,
          snapshot: input.lessonSnapshot,
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
            console.log(state);

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
      } catch (error) {
        const message = "Failed to export quiz";
        reportErrorResult({ error, message }, input);
        return {
          error,
          message,
        };
      }
    }),

  exportLessonPlanDoc: protectedProcedure
    .input(
      z.object({
        data: exportDocLessonPlanSchema.passthrough(),
        chatId: z.string(),
        messageId: z.string(),
      }),
    )
    .output(outputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await clerkClient.users.getUser(ctx.auth.userId);
        const userEmail = user?.emailAddresses[0]?.emailAddress;
        const exportType = "LESSON_PLAN_DOC";

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
          category: "exportLessonPlanDoc",
          message: "Got or saved snapshot",
          data: { lessonSnapshot },
        });

        const exportData = await ailaGetExportBySnapshotId({
          prisma: ctx.prisma,
          snapshotId: lessonSnapshot.id,
          exportType,
        });

        Sentry.addBreadcrumb({
          category: "exportLessonPlanDoc",
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

        const result = await exportDocLessonPlan({
          snapshotId: lessonSnapshot.id,
          lessonPlan: input.data,
          userEmail,
          onStateChange: (state) => {
            console.log(state);

            Sentry.addBreadcrumb({
              category: "exportWorksheetDocs",
              message: "Export state change",
              data: state,
            });
          },
        });

        Sentry.addBreadcrumb({
          category: "exportLessonPlanDoc",
          message: "Got export result",
          data: { result },
        });

        if ("error" in result) {
          reportErrorResult(result, input);
          return {
            error: result.error,
            message: "Failed to export lesson plan",
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
      } catch (error) {
        const message = "Failed to export lesson plan";
        reportErrorResult({ error, message }, input);
        return {
          error,
          message,
        };
      }
    }),
  sendUserExportLink: protectedProcedure
    .input(
      z.object({
        lessonTitle: z.string(),
        title: z.string(),
        link: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await clerkClient.users.getUser(ctx.auth.userId);
      const userEmail = user?.emailAddresses[0]?.emailAddress;
      const userFirstName = user?.firstName;
      const { title, link, lessonTitle } = input;
      try {
        if (!userEmail) {
          return {
            error: new Error("User email not found"),
            message: "User email not found",
          };
        }
        const res = await sendEmail({
          from: "aila@thenational.academy",
          to: userEmail,
          subject: "Download your lesson made with Aila: " + lessonTitle,
          body: `
Hi ${userFirstName},

We made the lesson: ${lessonTitle}

You can use the following link to copy the lesson resources ${title.toLowerCase()} to your Google Drive: ${`${link.split("/edit")[0]}/copy`}

We hope the lesson goes well for you and your class. If you have any feedback for us, please let us know. You can simply reply to this email.

Aila,
Oak National Academy
`,
        });
        return res;
      } catch (error) {
        return error;
      }
    }),
  pollKvForLink: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const data = await kv.get(input.id);
      console.log("***id", input.id);
      console.log("***data", data);
      return data;
    }),
});

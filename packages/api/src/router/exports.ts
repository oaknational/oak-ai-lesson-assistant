import { SignedInAuthObject } from "@clerk/backend/internal";
import { clerkClient } from "@clerk/nextjs/server";
import { sendEmail } from "@oakai/core/src/utils/sendEmail";
import { PrismaClientWithAccelerate } from "@oakai/db";
import {
  LessonDeepPartial,
  exportDocLessonPlanSchema,
  exportDocQuizSchema,
  exportSlidesFullLessonSchema,
  exportDocsWorksheetSchema,
  exportQuizDesignerSlides,
} from "@oakai/exports";
import {
  ExportableQuizAppState,
  exportableQuizAppStateSchema,
} from "@oakai/exports/src/schema/input.schema";
import { DeepPartial } from "@oakai/exports/src/types";
import { aiLogger } from "@oakai/logger";
import { LessonExportType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { kv } from "@vercel/kv";
import crypto from "crypto";
import { z } from "zod";

import { LessonPlanJsonSchema } from "../../../aila/src/protocol/schema";
import { exportAdditionalMaterialsDoc } from "../export/exportAdditionalMaterialsDoc";
import { exportLessonPlan } from "../export/exportLessonPlan";
import { exportLessonSlides } from "../export/exportLessonSlides";
import { exportQuizDoc } from "../export/exportQuizDoc";
import { exportWorksheets } from "../export/exportWorksheets";
import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

const log = aiLogger("exports");

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
export async function ailaCheckIfSnapshotExists({
  prisma,
  userId,
  chatId,
  snapshot,
}: {
  prisma: Pick<PrismaClientWithAccelerate, "lessonSchema" | "lessonSnapshot">;
  userId: string;
  chatId: string;
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

  return {
    existingSnapshot,
    lessonSchema,
    hash,
  };
}
export async function ailaGetOrSaveSnapshot({
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
  const { existingSnapshot, lessonSchema, hash } =
    await ailaCheckIfSnapshotExists({
      prisma,
      userId,
      chatId,
      snapshot,
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

export async function qdGetOrSaveSnapshot({
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

export async function ailaSaveExport({
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

export async function qdSaveExport({
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

export async function ailaGetExportBySnapshotId({
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

export async function qdGetExportBySnapshotId({
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

export const reportErrorResult = (
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
export type OutputSchema = z.infer<typeof outputSchema>;

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
        return await exportLessonSlides({ input, ctx });
      } catch (error) {
        const message = "Failed to export lesson";
        reportErrorResult({ error, message }, input);
        return {
          error,
          message,
        };
      }
    }),
  checkIfLessonPlanDownloadExists: protectedProcedure
    .input(
      z.object({
        data: exportDocLessonPlanSchema.passthrough(),
        chatId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.auth.userId;
        const { chatId, data } = input;
        const { existingSnapshot } = await ailaCheckIfSnapshotExists({
          prisma: ctx.prisma,
          userId,
          chatId,
          snapshot: data,
        });
        if (!existingSnapshot) {
          log("No existing snapshot found");
          return;
        }

        const exportData = await ailaGetExportBySnapshotId({
          prisma: ctx.prisma,
          snapshotId: existingSnapshot.id,
          exportType: "LESSON_PLAN_DOC",
        });
        if (exportData) {
          const output: OutputSchema = {
            link: exportData.gdriveFileUrl,
            canViewSourceDoc: exportData.userCanViewGdriveFile,
          };
          return output;
        }
      } catch (error) {
        console.error("Error checking if download exists:", error);
        const message = "Failed to check if download exists";
        return {
          error,
          message,
        };
      }
    }),
  checkIfSlideDownloadExists: protectedProcedure
    .input(
      z.object({
        data: exportSlidesFullLessonSchema.passthrough(),
        chatId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.auth.userId;
        const { chatId, data } = input;
        const { existingSnapshot } = await ailaCheckIfSnapshotExists({
          prisma: ctx.prisma,
          userId,
          chatId,
          snapshot: data,
        });
        if (!existingSnapshot) {
          log("No existing snapshot found");
          return;
        }
        // find the latest export for this snapshot
        const exportData = await ailaGetExportBySnapshotId({
          prisma: ctx.prisma,
          snapshotId: existingSnapshot.id,
          exportType: "LESSON_SLIDES_SLIDES",
        });
        if (exportData) {
          const output: OutputSchema = {
            link: exportData.gdriveFileUrl,
            canViewSourceDoc: exportData.userCanViewGdriveFile,
          };
          return output;
        }
      } catch (error) {
        console.error("Error checking if download exists:", error);
        const message = "Failed to check if download exists";
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
            log(state);

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
        return await exportAdditionalMaterialsDoc({ input, ctx });
      } catch (error) {
        const message = "Failed to export lesson";
        reportErrorResult({ error, message }, input);
        return {
          error,
          message,
        };
      }
    }),
  checkIfAdditionalMaterialsDownloadExists: protectedProcedure
    .input(
      z.object({
        data: exportDocLessonPlanSchema.passthrough(),
        chatId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.auth.userId;
        const { chatId, data } = input;
        const { existingSnapshot } = await ailaCheckIfSnapshotExists({
          prisma: ctx.prisma,
          userId,
          chatId,
          snapshot: data,
        });
        if (!existingSnapshot) {
          log("No existing snapshot found");
          return;
        }

        const exportData = await ailaGetExportBySnapshotId({
          prisma: ctx.prisma,
          snapshotId: existingSnapshot.id,
          exportType: "ADDITIONAL_MATERIALS_DOCS",
        });
        if (exportData) {
          const output: OutputSchema = {
            link: exportData.gdriveFileUrl,
            canViewSourceDoc: exportData.userCanViewGdriveFile,
          };
          return output;
        }
      } catch (error) {
        console.error("Error checking if download exists:", error);
        const message = "Failed to check if download exists";
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
        return await exportWorksheets({ input, ctx });
      } catch (error) {
        const message = "Failed to export worksheet";
        reportErrorResult({ error, message }, input);
        return {
          error,
          message,
        };
      }
    }),
  checkIfWorksheetDownloadExists: protectedProcedure
    .input(
      z.object({
        data: exportDocsWorksheetSchema.passthrough(),
        chatId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.auth.userId;
        const { chatId, data } = input;
        const { existingSnapshot } = await ailaCheckIfSnapshotExists({
          prisma: ctx.prisma,
          userId,
          chatId,
          snapshot: data,
        });
        if (!existingSnapshot) {
          log("No existing snapshot found");
          return;
        }

        const exportData = await ailaGetExportBySnapshotId({
          prisma: ctx.prisma,
          snapshotId: existingSnapshot.id,
          exportType: "WORKSHEET_SLIDES",
        });
        if (exportData) {
          const output: OutputSchema = {
            link: exportData.gdriveFileUrl,
            canViewSourceDoc: exportData.userCanViewGdriveFile,
          };
          return output;
        }
      } catch (error) {
        console.error("Error checking if download exists:", error);
        const message = "Failed to check if download exists";
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
        return await exportQuizDoc({ input, ctx });
      } catch (error) {
        const message = "Failed to export quiz";
        reportErrorResult({ error, message }, input);
        return {
          error,
          message,
        };
      }
    }),
  checkIfQuizDownloadExists: protectedProcedure
    .input(
      z.object({
        data: exportDocQuizSchema.passthrough(),
        lessonSnapshot: z.object({}).passthrough(),
        chatId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.auth.userId;
        const { chatId, data, lessonSnapshot } = input;
        const { existingSnapshot } = await ailaCheckIfSnapshotExists({
          prisma: ctx.prisma,
          userId,
          chatId,
          snapshot: lessonSnapshot,
        });
        if (!existingSnapshot) {
          log("No existing snapshot found");
          return;
        }

        const exportType =
          data.quizType === "exit" ? "EXIT_QUIZ_DOC" : "STARTER_QUIZ_DOC";

        const exportData = await ailaGetExportBySnapshotId({
          prisma: ctx.prisma,
          snapshotId: existingSnapshot.id,
          exportType,
        });
        if (exportData) {
          const output: OutputSchema = {
            link: exportData.gdriveFileUrl,
            canViewSourceDoc: exportData.userCanViewGdriveFile,
          };
          return output;
        }
      } catch (error) {
        console.error("Error checking if download exists:", error);
        const message = "Failed to check if download exists";
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
        return await exportLessonPlan({ input, ctx });
      } catch (error) {
        console.error("Error checking if download exists:", error);
        const message = "Failed to check if download exists";
        return {
          error,
          message,
        };
      }
    }),
  generateAllAssetExports: protectedProcedure
    .input(
      z.object({
        data: exportDocLessonPlanSchema.passthrough(),
        messageId: z.string(),
        chatId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const [
          lessonSlides,
          lessonPlan,
          worksheet,
          additionalMaterials,
          starterQuiz,
          exitQuiz,
        ] = await Promise.all([
          exportLessonSlides({ input, ctx }),
          exportLessonPlan({ input, ctx }),
          exportWorksheets({ input, ctx }),
          exportAdditionalMaterialsDoc({ input, ctx }),
          exportQuizDoc({
            input: {
              data: {
                lessonTitle: input.data.title,
                quizType: "starter",
                quiz: input.data.starterQuiz,
              },
              lessonSnapshot: input.data,
              chatId: input.chatId,
              messageId: input.messageId,
            },
            ctx,
          }),
          exportQuizDoc({
            input: {
              data: {
                lessonTitle: input.data.title,
                quizType: "exit",
                quiz: input.data.exitQuiz,
              },
              lessonSnapshot: input.data,
              chatId: input.chatId,
              messageId: input.messageId,
            },
            ctx,
          }),
        ]);

        function getValidLink(
          data:
            | {
                link: string;
                canViewSourceDoc: boolean;
              }
            | {
                error: unknown;
                message: string;
              },
        ): string | undefined {
          if (data && "link" in data && typeof data.link === "string") {
            return data.link;
          }
          if ("error" in data && "message" in data) {
            Sentry.captureException(data.error, {
              extra: {
                error: data.error,
                message: data.message,
              },
            });
            throw new Error(data.message);
          }
        }

        const allExports = {
          lessonSlides: getValidLink(lessonSlides),
          lessonPlan: getValidLink(lessonPlan),
          worksheet: getValidLink(worksheet),
          additionalMaterials: getValidLink(additionalMaterials),
          starterQuiz: getValidLink(starterQuiz),
          exitQuiz: getValidLink(exitQuiz),
        };

        return allExports;
      } catch (error) {
        console.error("Error generating all asset exports:", error);
        return {
          error,
          message: "Failed to generate all asset exports",
        };
      }
    }),
  sendUserAllAssetsEmail: protectedProcedure
    .input(
      z.object({
        lessonTitle: z.string(),
        lessonPlanLink: z.string(),
        slidesLink: z.string(),
        worksheetLink: z.string(),
        starterQuizLink: z.string(),
        exitQuizLink: z.string(),
        additionalMaterialsLink: z.string(),
      }),
    )
    .output(z.boolean())
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await clerkClient.users.getUser(ctx.auth.userId);
        const userEmail = user?.emailAddresses[0]?.emailAddress;
        const userFirstName = user?.firstName;
        const {
          lessonTitle,
          lessonPlanLink,
          slidesLink,
          worksheetLink,
          starterQuizLink,
          exitQuizLink,
          additionalMaterialsLink,
        } = input;

        if (!userEmail) {
          console.error("User email not found");
          return false;
        }

        const emailSent = await sendEmail({
          from: "aila@thenational.academy",
          to: userEmail,
          name: "Oak National Academy",
          subject: "Download your lesson made with Aila: " + lessonTitle,
          body: `
Hi ${userFirstName},

These are the lesson resources that you created with Aila.
You can use the following links to copy the lesson resources to your Google Drive.

Lesson plan: ${`${lessonPlanLink.split("/edit")[0]}/copy`}
Slides: ${`${slidesLink.split("/edit")[0]}/copy`}
Worksheet: ${`${worksheetLink.split("/edit")[0]}/copy`}
Starter quiz: ${`${starterQuizLink.split("/edit")[0]}/copy`}
Exit quiz: ${`${exitQuizLink.split("/edit")[0]}/copy`}
Additional materials: ${`${additionalMaterialsLink.split("/edit")[0]}/copy`}

We hope the lesson goes well for you and your class. If you have any feedback for us, please let us know. You can simply reply to this email.

Aila,
Oak National Academy`,
        });

        return emailSent ? true : false;
      } catch (error) {
        console.error("Error sending email:", error);
        return false;
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
      try {
        const user = await clerkClient.users.getUser(ctx.auth.userId);
        const userEmail = user?.emailAddresses[0]?.emailAddress;
        const userFirstName = user?.firstName;
        const { title, link, lessonTitle } = input;

        if (!userEmail) {
          console.error("User email not found");
          return false;
        }

        const emailSent = await sendEmail({
          from: "aila@thenational.academy",
          to: userEmail,
          name: "Oak National Academy",
          subject: "Download your lesson made with Aila: " + lessonTitle,
          body: `
Hi ${userFirstName},

We made the lesson: ${lessonTitle}

You can use the following link to copy the lesson resources ${title.toLowerCase()} to your Google Drive: ${`${link.split("/edit")[0]}/copy`}

We hope the lesson goes well for you and your class. If you have any feedback for us, please let us know. You can simply reply to this email.

Aila,
Oak National Academy`,
        });

        return emailSent ? true : false;
      } catch (error) {
        console.error("Error sending email:", error);
        return false;
      }
    }),
  pollKvForLink: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const data = await kv.get(input.id);
      log("***id", input.id);
      log("***data", data);
      return data;
    }),
  checkDownloadAllStatus: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input }) => {
      const { taskId } = input;
      const status: "loading" | "error" | "complete" | null =
        await kv.get(taskId);
      return status;
    }),
});

import { sendEmail } from "@oakai/core/src/utils/sendEmail";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import {
  exportDocLessonPlanSchema,
  exportDocQuizSchema,
  exportDocsWorksheetSchema,
  exportSlidesFullLessonSchema,
} from "@oakai/exports";
import { aiLogger } from "@oakai/logger";

import type { SignedInAuthObject } from "@clerk/backend/internal";
import { clerkClient } from "@clerk/nextjs/server";
import type { LessonExportType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { kv } from "@vercel/kv";
import { z } from "zod";

import { exportAdditionalMaterialsDoc } from "../export/exportAdditionalMaterialsDoc";
import { getExistingExportData } from "../export/exportHelpers";
import { exportLessonPlan } from "../export/exportLessonPlan";
import { exportLessonSlides } from "../export/exportLessonSlides";
import { exportQuizDoc } from "../export/exportQuizDoc";
import { exportWorksheets } from "../export/exportWorksheets";
import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

const log = aiLogger("exports");

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
      expiredAt: null,
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
        messageId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const exportType = "LESSON_PLAN_DOC";
        const { exportData } = await getExistingExportData({
          ctx,
          input,
          exportType,
        });

        if (exportData) {
          return exportData;
        }
      } catch (error) {
        log.error("Error checking if download exists:", error);
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
        messageId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // find the latest export for this snapshot
        const exportType = "LESSON_SLIDES_SLIDES";
        const { exportData } = await getExistingExportData({
          ctx,
          input,
          exportType,
        });

        if (exportData) {
          return exportData;
        }
      } catch (error) {
        log.error("Error checking if download exists:", error);
        const message = "Failed to check if download exists";
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
        const message = "Failed to export additional materials";
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
        messageId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const exportType = "ADDITIONAL_MATERIALS_DOCS";
        const { exportData } = await getExistingExportData({
          ctx,
          input,
          exportType,
        });

        if (exportData) {
          return exportData;
        }
      } catch (error) {
        log.error("Error checking if download exists:", error);
        const message =
          "Failed to check if additional materials download exists";
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
        messageId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const exportType = "WORKSHEET_SLIDES";
        const { exportData } = await getExistingExportData({
          ctx,
          input,
          exportType,
        });

        if (exportData) {
          return exportData;
        }
      } catch (error) {
        log.error("Error checking if download exists:", error);
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
        messageId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const exportType =
          input.data.quizType === "exit" ? "EXIT_QUIZ_DOC" : "STARTER_QUIZ_DOC";

        const { exportData } = await getExistingExportData({
          ctx,
          input,
          exportType,
        });

        if (exportData) {
          return exportData;
        }
      } catch (error) {
        log.error("Error checking if download exists:", error);
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
        log.error("Error checking if download exists:", error);
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
        log.error("Error generating all asset exports:", error);
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
          log.error("User email not found");
          return false;
        }

        const emailSent = await sendEmail({
          from: "aila@thenational.academy",
          to: userEmail,
          name: "Oak National Academy",
          subject: "Download your lesson made with Aila: " + lessonTitle,
          htmlBody: `<p>Hi ${userFirstName},</p>

        <p>These are the lesson resources that you created with Aila.<br>
        You can use the following links to copy the lesson resources to your Google Drive.</p>  

        <a href="${`${lessonPlanLink.split("/edit")[0]}/copy`}" target="_blank">Lesson plan</a><br>
        <a href="${`${slidesLink.split("/edit")[0]}/copy`}" target="_blank">Slides</a><br>
        <a href="${`${worksheetLink.split("/edit")[0]}/copy`}" target="_blank">Worksheet</a><br>
        <a href="${`${starterQuizLink.split("/edit")[0]}/copy`}" target="_blank">Starter quiz</a><br>
        <a href="${`${exitQuizLink.split("/edit")[0]}/copy`}" target="_blank">Exit quiz</a><br>
        <a href="${`${additionalMaterialsLink.split("/edit")[0]}/copy`}" target="_blank">Additional materials</a></p><br>

        
        <p>We hope the lesson goes well for you and your class. If you have any feedback for us, please let us know. You can simply reply to this email.</p>
        
        <p>Aila<br>
        Oak National Academy</p>`,
        });

        return emailSent ? true : false;
      } catch (error) {
        log.error("Error sending email:", error);
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
          log.error("User email not found");
          return false;
        }

        const htmlBody = `<p>Hi ${userFirstName},</p>
        
        <p>We made the lesson: <strong>${lessonTitle}</strong></p>
        
        <p>You can use the following link to copy the lesson resources <strong>${title.toLowerCase()}</strong> to your Google Drive: 
          <a href="${`${link.split("/edit")[0]}/copy`}" target="_blank">${`${link.split("/edit")[0]}/copy`}</a>
        </p>
        
        <p>We hope the lesson goes well for you and your class. If you have any feedback for us, please let us know. You can simply reply to this email.</p>
        
        <p>Best regards,<br>
        Aila,<br>
        Oak National Academy</p>`;

        const emailSent = await sendEmail({
          from: "aila@thenational.academy",
          to: userEmail,
          name: "Oak National Academy",
          subject: "Download your lesson made with Aila: " + lessonTitle,
          htmlBody: htmlBody,
        });

        return emailSent ? true : false;
      } catch (error) {
        log.error("Error sending email:", error);
        return false;
      }
    }),
  pollKvForLink: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const data = await kv.get(input.id);
      log.info("***id", input.id);
      log.info("***data", data);
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

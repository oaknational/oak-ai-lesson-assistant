import { generateAdditionalMaterialModeration } from "@oakai/additional-materials";
import {
  type AdditionalMaterialSchemas,
  type AdditionalMaterialType,
  actionEnum,
  additionalMaterialTypeEnum,
  generateAdditionalMaterialInputSchema,
} from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { transformDataForExport } from "@oakai/additional-materials/src/documents/additionalMaterials/dataHelpers/transformDataForExports";
import { generateAdditionalMaterialObject } from "@oakai/additional-materials/src/documents/additionalMaterials/generateAdditionalMaterialObject";
import type { GlossarySchema } from "@oakai/additional-materials/src/documents/additionalMaterials/glossary/schema";
import {
  type OakOpenAiLessonSummary,
  type OakOpenAiTranscript,
  type OakOpenApiSearchSchema,
  oakOpenAiLessonSummarySchema,
  oakOpenAiTranscriptSchema,
  oakOpenApiSearchSchema,
} from "@oakai/additional-materials/src/schemas/oakOpenApi";
import { ailaUserModificationModel } from "@oakai/db";
import {
  exportAdditionalResourceDoc,
  transformDataGlossary,
} from "@oakai/exports/src/exportAdditionalResourceDoc";
import type { GlossaryTemplate } from "@oakai/exports/src/schema/resourceDoc.schema";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import { ZodError, z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";
import { checkMutationPermissions } from "./helpers/checkMutationPermissions";

const log = aiLogger("additional-materials");
const OPENAI_AUTH_TOKEN = process.env.OPENAI_AUTH_TOKEN;

export const additionalMaterialsRouter = router({
  generateAdditionalMaterial: protectedProcedure
    .input(
      z.object({
        action: z.string(),
        context: z.unknown(),
        documentType: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<AdditionalMaterialSchemas> => {
      log.info("fetching additional materials");

      try {
        const parsedInput =
          generateAdditionalMaterialInputSchema.safeParse(input);
        if (!parsedInput.success) {
          log.error("Failed to parse input", parsedInput.error);
          throw new ZodError(parsedInput.error.issues);
        }
        const parsedAction = actionEnum.parse(input.action);

        const result = await generateAdditionalMaterialObject({
          provider: "openai",
          parsedInput: parsedInput.data,
          action: parsedAction,
        });

        // const testExport = await exportAdditionalResourceDoc({
        //   userEmail: "email",
        //   onStateChange: (state) => {
        //     log.info(state);

        //     // Sentry.addBreadcrumb({
        //     //   category: "exportWorksheetDocs",
        //     //   message: "Export state change",
        //     //   data: state,
        //     // });
        //   },
        //   documentType: parsedInput.data.documentType,
        //   data: result,
        //   // transformData: transformDataGlossary<
        //   //   GlossarySchema,
        //   //   GlossaryTemplate
        //   // >(),
        //   transformData: transformDataForExport(
        //     parsedInput.data.documentType,
        //   )(),
        // });

        console.log("testExport", testExport);
        if (!result) {
          throw new Error("Failed to generate additional material");
        }

        return result;
      } catch (cause) {
        const TrpcError = new Error("Failed to fetch additional materials", {
          cause,
        });
        log.error("Failed to fetch additional material", cause);
        Sentry.captureException(TrpcError);
        throw TrpcError;
      }
    }),
  exportAdditionalMaterial: protectedProcedure
    .input(
      z.object({
        material: z.unknown(),
        documentType: additionalMaterialTypeEnum,
      }),
    )
    .mutation(async ({ ctx, input }): Promise<AdditionalMaterialSchemas> => {
      log.info("fetching additional materials");

      const { userId } = ctx.auth;

      if (!userId) {
        const TrpcError = new Error("Attempted to export without userId");
        log.error("Failed to export additional material", TrpcError);
        throw TrpcError;
      }

      try {
        await checkMutationPermissions(userId);
        const exportLink = await exportAdditionalResourceDoc({
          userEmail: "email",
          onStateChange: (state) => {
            log.info(state);

            Sentry.addBreadcrumb({
              category: "exportAdditionalResourceDoc",
              message: "Export state change",
              data: state,
            });
          },
          documentType: input.documentType,
          data: input.material,

          transformData: transformDataForExport(input.documentType)(),
        });

        console.log("testExport", exportLink);

        return result;
      } catch (cause) {
        const TrpcError = new Error("Failed to fetch additional materials", {
          cause,
        });
        log.error("Failed to fetch additional material", cause);
        Sentry.captureException(TrpcError);
        throw TrpcError;
      }
    }),
  generateAdditionalMaterialModeration: protectedProcedure
    .input(
      z.object({
        generation: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<string> => {
      const { generation } = input;
      log.info("Fetch additional materials moderation", ctx);

      try {
        const result = await generateAdditionalMaterialModeration(generation);

        return result;
      } catch (cause) {
        const TrpcError = new Error(
          "Failed to fetch additional material moderation",
          { cause },
        );
        log.error("Failed to fetch additional material moderation", cause);
        Sentry.captureException(TrpcError);
        throw TrpcError;
      }
    }),
  fetchOWALessonData: protectedProcedure
    .input(
      z.object({
        lessonSlug: z.string(),
      }),
    )
    .query(
      async ({
        ctx,
        input,
      }): Promise<{
        lessonSummary: OakOpenAiLessonSummary;
        lessonTranscript: OakOpenAiTranscript;
      }> => {
        const { lessonSlug } = input;
        log.info("Fetch oak lesson from oak open api", ctx);

        try {
          const [summaryRes, transcriptRes] = await Promise.all([
            fetch(
              `https://open-api.thenational.academy/api/v0/lessons/${lessonSlug}/summary`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${OPENAI_AUTH_TOKEN}`,
                  Accept: "application/json",
                },
              },
            ),
            fetch(
              `https://open-api.thenational.academy/api/v0/lessons/${lessonSlug}/transcript`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${OPENAI_AUTH_TOKEN}`,
                  Accept: "application/json",
                },
              },
            ),
          ]);

          const summaryData = oakOpenAiLessonSummarySchema.parse(
            await summaryRes.json(),
          );
          const transcriptData = oakOpenAiTranscriptSchema.parse(
            await transcriptRes.json(),
          );

          return {
            lessonSummary: summaryData,
            lessonTranscript: transcriptData,
          };
        } catch (cause) {
          const TrpcError = new Error("Failed to fetch oak open ai lesson", {
            cause,
          });
          log.error("Failed to fetch oak open ai lesson", cause);
          Sentry.captureException(TrpcError);
          throw TrpcError;
        }
      },
    ),
  searchOWALesson: protectedProcedure
    .input(
      z.object({
        query: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<OakOpenApiSearchSchema> => {
      const { query } = input;
      log.info("Fetch oak lesson from oak open api");

      try {
        const response = await fetch(
          `https://open-api.thenational.academy/api/v0/search/lessons?q=${query}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${OPENAI_AUTH_TOKEN}`,
              Accept: "application/json",
            },
          },
        );

        const data = await response.json();

        return oakOpenApiSearchSchema.parse(data);
      } catch (cause) {
        const TrpcError = new Error("Failed to search oak open ai lesson", {
          cause,
        });
        log.error("Failed to search oak open ai lesson", cause);
        Sentry.captureException(TrpcError);
        throw TrpcError;
      }
    }),
});

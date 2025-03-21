import { fetchAdditionalMaterial } from "@oakai/additional-materials/src/fetchAdditionalMaterial";
import { fetchAdditionalMaterialModeration } from "@oakai/additional-materials/src/fetchAdditionalMaterialModeration";
import {
  type AdditionalMaterialType,
  type OakOpenAiLessonSummary,
  type OakOpenAiTranscript,
  type OakOpenApiSearchSchema,
  oakOpenAiLessonSummarySchema,
  oakOpenAiTranscriptSchema,
  oakOpenApiSearchSchema,
} from "@oakai/additional-materials/src/schemas";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

const log = aiLogger("additional-materials");
const OPENAI_AUTH_TOKEN = process.env.OPENAI_AUTH_TOKEN;

export const additionalMaterialsRouter = router({
  getAdditionalMaterial: protectedProcedure
    .input(
      z.object({
        lessonPlan: z.any(),
        action: z.string(),
        message: z.string().optional(),
        previousOutput: z.object({}).passthrough().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<AdditionalMaterialType> => {
      const { lessonPlan, action, message, previousOutput } = input;
      log.info("fetching additional materials");

      try {
        const result = await fetchAdditionalMaterial({
          lessonPlan,
          action,
          message,
          previousOutput,
        });

        return result as AdditionalMaterialType;
      } catch (cause) {
        const TrpcError = new Error("Failed to fetch additional material", {
          cause,
        });
        log.error("Failed to fetch additional material", cause);
        Sentry.captureException(TrpcError);
        throw TrpcError;
      }
    }),
  getAdditionalMaterialModeration: protectedProcedure
    .input(
      z.object({
        generation: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<string> => {
      const { generation } = input;
      log.info("Fetch additional materials moderation", ctx);

      try {
        const result = await fetchAdditionalMaterialModeration(generation);

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
          const responseSummary = await fetch(
            `https://open-api.thenational.academy/api/v0/lessons/${lessonSlug}/summary`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${OPENAI_AUTH_TOKEN}`,
                Accept: "application/json",
              },
            },
          );
          const responseTranscript = await fetch(
            `https://open-api.thenational.academy/api/v0/lessons/${lessonSlug}/transcript`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${OPENAI_AUTH_TOKEN}`,
                Accept: "application/json",
              },
            },
          );
          const summaryData = oakOpenAiLessonSummarySchema.parse(
            await responseSummary.json(),
          );
          const transcriptData = oakOpenAiTranscriptSchema.parse(
            await responseTranscript.json(),
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

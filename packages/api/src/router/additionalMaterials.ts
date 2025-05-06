import { generateAdditionalMaterialModeration } from "@oakai/additional-materials";
import {
  type AdditionalMaterialSchemas,
  actionEnum,
  generateAdditionalMaterialInputSchema,
} from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { generateAdditionalMaterialObject } from "@oakai/additional-materials/src/documents/additionalMaterials/generateAdditionalMaterialObject";
import { generatePartialLessonPlanObject } from "@oakai/additional-materials/src/documents/partialLessonPlan/generateLessonPlan";
import { partialLessonContextSchema } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import {
  type OakOpenAiLessonSummary,
  type OakOpenAiTranscript,
  type OakOpenApiSearchSchema,
  oakOpenAiLessonSummarySchema,
  oakOpenAiTranscriptSchema,
  oakOpenApiSearchSchema,
} from "@oakai/additional-materials/src/schemas/oakOpenApi";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import { ZodError, z } from "zod";

import type { LooseLessonPlan } from "../../../aila/src/protocol/schema";
import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

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

        if (!result) {
          throw new Error("Failed to generate additional material", result);
        }

        return result;
      } catch (cause) {
        const TrpcError = new Error(
          "Failed to fetch additional material moderation",
          { cause },
        );
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
      log.info("Fetch additional material moderation", ctx);

      try {
        const result = await generateAdditionalMaterialModeration(generation);

        if (!result) {
          throw new Error("Failed to generate additional material");
        }

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
  generatePartialLessonPlanObject: protectedProcedure
    .input(partialLessonContextSchema)
    .mutation(async ({ ctx, input }): Promise<LooseLessonPlan> => {
      log.info("Generate partial lesson plan", input);
      const parsedInput = partialLessonContextSchema.safeParse(input);
      if (!parsedInput.success) {
        log.error("Failed to parse input", parsedInput.error);
        throw new ZodError(parsedInput.error.issues);
      }

      try {
        const result = await generatePartialLessonPlanObject({
          provider: "openai",
          parsedInput: { context: parsedInput.data },
        });

        if (!result) {
          throw new Error("Failed to generate partial lesson plan", result);
        }

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

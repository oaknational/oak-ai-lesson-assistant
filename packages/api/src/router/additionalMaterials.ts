import { generateAdditionalMaterialModeration } from "@oakai/additional-materials";
import {
  type AdditionalMaterialSchemas,
  actionEnum,
  additionalMaterialsConfigMap,
  generateAdditionalMaterialInputSchema,
} from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { generateAdditionalMaterialObject } from "@oakai/additional-materials/src/documents/additionalMaterials/generateAdditionalMaterialObject";
import { generatePartialLessonPlanObject } from "@oakai/additional-materials/src/documents/partialLessonPlan/generateLessonPlan";
import { partialLessonContextSchema } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import { additionalMaterialsModerationService } from "@oakai/additional-materials/src/moderation";
import {
  type OakOpenAiLessonSummary,
  type OakOpenAiTranscript,
  type OakOpenApiSearchSchema,
  oakOpenAiLessonSummarySchema,
  oakOpenAiTranscriptSchema,
  oakOpenApiSearchSchema,
} from "@oakai/additional-materials/src/schemas/oakOpenApi";
import {
  type Message,
  performLakeraThreatCheck,
} from "@oakai/additional-materials/src/threatDetection/lakeraThreatCheck";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
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
        resourceId: z.string().nullish(),
        lessonId: z.string().nullish(),
      }),
    )
    .mutation(
      async ({
        ctx,
        input,
      }): Promise<{
        resource: AdditionalMaterialSchemas | null;
        moderation: ModerationResult;
        resourceId: string | undefined;
      }> => {
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

          const moderation = await generateAdditionalMaterialModeration({
            input: JSON.stringify(result),
            provider: "openai",
          });

          const { resourceId, documentType } = parsedInput.data;
          const version = additionalMaterialsConfigMap[documentType].version;

          const interaction = await ctx.prisma.interaction.create({
            data: {
              userId: ctx.auth.userId,
              config: {
                resourceType: documentType,
                resourceTypeVersion: version,
                adaptation: parsedInput.data.context.refinement,
              },
              adaptsOutputId:
                parsedAction === "refine" && resourceId ? resourceId : null,
              output: result,
              outputModeration: moderation,
              derivedFromId: input.lessonId,
            },
          });

          if (isToxic(moderation)) {
            log.error("Toxic content detected in moderation", moderation);
            return {
              resource: null,
              moderation: moderation,
              resourceId: interaction.id,
            };
          }

          return {
            resource: result,
            moderation: moderation,
            resourceId: interaction.id,
          };
        } catch (cause) {
          const TrpcError = new Error(
            "Failed to fetch additional material moderation",
            { cause },
          );
          log.error("Failed to fetch additional material moderation", cause);
          Sentry.captureException(TrpcError);
          throw TrpcError;
        }
      },
    ),
  generateAdditionalMaterialModeration: protectedProcedure
    .input(
      z.object({
        generation: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<string> => {
      return "no";
    }),
  generatePartialLessonPlanObject: protectedProcedure
    .input(partialLessonContextSchema)
    .mutation(
      async ({
        ctx,
        input,
      }): Promise<{
        lesson: LooseLessonPlan | null;
        lessonId: string;
        threatDetection: boolean;
        moderation: ModerationResult;
      }> => {
        const userId = ctx.auth.userId;
        log.info("Generate partial lesson plan", input);
        const parsedInput = partialLessonContextSchema.safeParse(input);
        if (!parsedInput.success) {
          log.error("Failed to parse input", parsedInput.error);
          throw new ZodError(parsedInput.error.issues);
        }

        const { subject, title } = parsedInput.data;

        try {
          const messages: Message[] = [
            { role: "user", content: `${subject} - ${title}` },
          ];
          const lakeraResult = await performLakeraThreatCheck({
            messages: messages,
          });

          const lesson = await generatePartialLessonPlanObject({
            provider: "openai",
            parsedInput: { context: parsedInput.data },
          });

          log.info("Generated lesson plan", lesson);

          if (!lesson) {
            throw new Error("Failed to generate additional material", lesson);
          }

          const moderation = await generateAdditionalMaterialModeration({
            input: JSON.stringify(lesson),
            provider: "openai",
          });

          const interaction = await ctx.prisma.interaction.create({
            data: {
              userId,
              inputText: `${subject} - ${title}`,
              config: {
                resourceType: "partial-lesson-plan",
                resourceTypeVersion: 1, // set this from config
              },
              output: lesson,
              outputModeration: moderation,
              inputThreatDetection: {
                flagged: lakeraResult.flagged,
                metadata: lakeraResult,
              },
            },
          });
          if (isToxic(moderation)) {
            log.error("Toxic content detected in moderation", moderation);
            return {
              threatDetection: lakeraResult.flagged,
              lesson: null,
              lessonId: interaction.id,
              moderation: moderation,
            };
          }

          if (lakeraResult.flagged) {
            log.error("Threat detected in input");

            return {
              threatDetection: true,
              lesson: null,
              lessonId: interaction.id,
              moderation: moderation,
            };
          }
          return {
            threatDetection: false,
            lesson: lesson,
            lessonId: interaction.id,
            moderation: moderation,
          };
        } catch (cause) {
          const TrpcError = new Error(
            "Failed to fetch additional material moderation",
            { cause },
          );
          log.error("Failed to fetch lesson plan", cause);
          Sentry.captureException(TrpcError);
          throw TrpcError;
        }
      },
    ),
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

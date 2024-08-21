import { LessonSummaries, Lessons, Snippets, inngest } from "@oakai/core";
import { Feedback } from "@oakai/core/src/models/feedback";
import { Generations } from "@oakai/core/src/models/generations";
import { Prompts } from "@oakai/core/src/models/prompts";
import {
  serializeGeneration,
  serializedGenerationSchema,
} from "@oakai/core/src/models/serializers";
import {
  GenerationPart,
  generationPartSchema,
  generationPartUserTweakedSchema,
} from "@oakai/core/src/types";
import { sendQuizFeedbackEmail } from "@oakai/core/src/utils/sendQuizFeedbackEmail";
import logger from "@oakai/logger";
import { TRPCError } from "@trpc/server";
import { Redis } from "@upstash/redis";
import { uniq } from "remeda";
import { z } from "zod";

import { apiKeyProtectedProcedure } from "../middleware/apiKeyAuth";
import { protectedProcedure } from "../middleware/auth";
import { userBasedRateLimitProcedure } from "../middleware/rateLimiter";
import { router } from "../trpc";
import { rateLimitInfoSchema } from "../types";

const redis = new Redis({
  url: process.env.KV_REST_API_URL as string,
  token: process.env.KV_REST_API_TOKEN as string,
});

export const generationRouter = router({
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(serializedGenerationSchema)
    .query(async ({ ctx, input }) => {
      const { id: generationId } = input;
      const { userId } = ctx.auth;

      const generation = await ctx.prisma.generation.findFirst({
        where: {
          id: generationId,
          userId: userId ?? "",
        },
      });

      if (!generation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Generation not found",
        });
      }
      return serializeGeneration(generation);
    }),

  /**
   * Get an in-progress generation's response
   *
   * n.b. this is a protected procedure but doesn't
   * actually check the requesting user vs the owner
   * of the generation
   */
  getPartialResponse: protectedProcedure
    .input(z.string())
    .query(async ({ input: generationId }) => {
      const generationResponse = await redis.get(
        `partial-generation-${generationId}`,
      );

      if (!generationResponse) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Partial generation response not found",
        });
      }

      return generationResponse;
    }),

  request: userBasedRateLimitProcedure
    .input(
      z.object({
        appSlug: z.string(),
        promptSlug: z.string(),
        streamCompletion: z.boolean().default(false),
        sessionId: z.string(),
        lastGenerationId: z.string().nullable().optional(),
        promptInputs: z.object({}).passthrough(),
        factQuestion: z.string().optional(),
        addKnowledge: z.string().optional(),
        addTranscript: z.string().optional(),
      }),
    )
    .output(
      z.object({
        generation: serializedGenerationSchema,
        rateLimit: rateLimitInfoSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const generations = new Generations(ctx.prisma);
      const feedbackModel = new Feedback(ctx.prisma);
      const {
        appSlug,
        promptSlug,
        lastGenerationId,
        sessionId,
        promptInputs,
        streamCompletion,
        factQuestion,
        addKnowledge,
        addTranscript,
      } = input;

      const promptAndAppId = await ctx.prisma.prompt.findFirst({
        where: {
          slug: promptSlug,
          app: { slug: appSlug },
          current: true,
        },
        select: { id: true, appId: true },
      });

      if (!promptAndAppId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No app prompt found",
        });
      }

      const { id: promptId, appId } = promptAndAppId;

      let fact = "None";
      if (factQuestion) {
        const factResult = await new Snippets(ctx.prisma).answer({
          question: factQuestion,
          keyStage: (promptInputs.keyStage as string | undefined) ?? undefined,
          subject: (promptInputs.subject as string | undefined) ?? undefined,
        });
        if (factResult) {
          fact = factResult;
        }
      }

      let knowledge = "None";
      if (addKnowledge) {
        const lessonSummaries = await new LessonSummaries(ctx.prisma).search(
          addKnowledge,
          (promptInputs.keyStage as string | undefined) ?? undefined,
          (promptInputs.subject as string | undefined) ?? undefined,
          10,
        );

        if (lessonSummaries) {
          knowledge = uniq(
            lessonSummaries
              .map((l) => l.topics)
              .flat()
              .filter((t) => t.length < 40),
          ).join(", ");
        }
      }

      let transcript = "None";
      if (addTranscript) {
        const lessonsWithSnippets = await new Lessons(
          ctx.prisma,
        ).searchByTranscript(
          addTranscript,
          (promptInputs.keyStage as string | undefined) ?? undefined,
          (promptInputs.subject as string | undefined) ?? undefined,
          10,
        );

        if (lessonsWithSnippets) {
          transcript = lessonsWithSnippets
            .map((l) => l.snippets.map((s) => s.content).join("\n"))
            .flat()
            .join("\n");
        }
      }
      if (typeof ctx.auth.userId !== "string") {
        throw new Error("Missing userId");
      }
      const generation = await generations.createRequest(
        appId,
        promptId,
        sessionId,
        ctx.auth.userId,
      );

      await inngest.send({
        name: "app/generation.requested",
        data: {
          appId,
          promptId,
          promptInputs: { fact, knowledge, transcript, ...promptInputs },
          generationId: generation.id,
          streamCompletion,
        },
        user: {
          external_id: ctx.auth.userId,
        },
      });

      /**
       * Track if a generation is a re-generation
       *
       * For now don't let this derail the entire re-generation, so
       * log and continue on error
       */
      try {
        /**
         * Temporary workaround until we handle re-generations
         * differently
         */
        if (promptSlug.includes("regenerate-")) {
          logger.info(
            "Logging re-generation for generation %s",
            lastGenerationId,
          );
          if (lastGenerationId) {
            await feedbackModel.recordReGeneration(
              lastGenerationId,
              sessionId,
              generation.id,
            );
          } else {
            logger.error(
              "User tried to trigger re-generation generation but did not provide a lastGenerationId",
            );
          }
        }
      } catch (err) {
        logger.error(
          "Failed to save re-generation, generationId=%s",
          generation.id,
        );
      }

      console.log("Generation complete");

      return {
        generation: serializeGeneration(generation),
        rateLimit: ctx.rateLimit,
      };
    }),

  generateWithTemplate: apiKeyProtectedProcedure
    .input(
      z.object({
        promptTemplate: z.string(),
        promptInputs: z.object({}).passthrough(),
      }),
    )
    .output(z.object({}).passthrough())
    .mutation(async ({ ctx, input }) => {
      const prompts = new Prompts(ctx.prisma);
      const { promptTemplate, promptInputs } = input;

      const promptBody = await prompts.formatPrompt(
        promptTemplate,
        promptInputs,
      );
      const completion = await prompts.requestChatCompletion(promptBody);

      return {
        completion,
        rateLimit: ctx.rateLimit,
      };
    }),

  flag: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        user: z.object({
          email: z.string(),
        }),
        feedback: z.object({
          typedFeedback: z.string(),
          contentIsInappropriate: z.boolean(),
          contentIsFactuallyIncorrect: z.boolean(),
          contentIsNotHelpful: z.boolean(),
        }),
        flaggedItem: generationPartSchema(z.unknown()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { feedback, sessionId, user } = input;

      const feedbackModel = new Feedback(ctx.prisma);

      // We currently have some inconsistencies with zod generated
      // types in which value is coming back as potentially undefined
      // so cast it here for now
      const flaggedItem = input.flaggedItem as GenerationPart;

      if (!flaggedItem.lastGenerationId) {
        logger.error(
          "User tried to flag generation but did not provide a valid generation part %o",
          flaggedItem,
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing lastGenerationId",
        });
      }

      const flaggedGenerationResponse = await ctx.prisma.generation.findFirst({
        where: {
          id: flaggedItem.lastGenerationId,
        },
      });

      await sendQuizFeedbackEmail({
        user,
        flaggedItem: flaggedItem,
        feedback,
        generationResponse: JSON.stringify(flaggedGenerationResponse?.response),
      });

      logger.debug(
        "Giving feedback for generation %s",
        flaggedItem.lastGenerationId,
      );

      try {
        await feedbackModel.recordUserFlag(
          flaggedItem.lastGenerationId,
          sessionId,
          feedback.typedFeedback,
          JSON.stringify(flaggedItem.value),
          {
            isInappropriate: feedback.contentIsInappropriate,
            isIncorrect: feedback.contentIsFactuallyIncorrect,
            isUnhelpful: feedback.contentIsNotHelpful,
          },
        );
      } catch (err) {
        // Swallow the error for now as the FE swallows them to not interrupt
        logger.error(
          err,
          "Failed to record user flagging %s",
          flaggedItem.lastGenerationId,
        );
      }

      return true;
    }),

  recordUserTweak: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        tweakedItem: generationPartUserTweakedSchema(z.any()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { tweakedItem, sessionId } = input;
      logger.info(
        "Logging user tweak for generation %s",
        tweakedItem.lastGenerationId,
      );

      const feedbackModel = new Feedback(ctx.prisma);

      if (!tweakedItem.lastGenerationId) {
        logger.error(
          "User tried to flag generation but did not provide a valid generation part %o",
          tweakedItem,
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing lastGenerationId",
        });
      }

      try {
        await feedbackModel.recordUserTweak(
          tweakedItem.lastGenerationId,
          sessionId,
          tweakedItem.value,
          tweakedItem.originalValue,
        );
      } catch (err) {
        // Swallow the error for now as the FE swallows them to not interrupt
        logger.error(
          err,
          "Failed to record user tweak for generation=%s",
          tweakedItem.lastGenerationId,
        );
      }

      return true;
    }),
});

import { demoUsers } from "@oakai/core";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import { rateLimits } from "@oakai/core/src/utils/rateLimiting";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/errors";
import { aiLogger } from "@oakai/logger";
import { partialLessonContextSchema } from "@oakai/teaching-materials/src/documents/partialLessonPlan/schema";
import {
  generateTeachingMaterialInputSchema,
  teachingMaterialTypeEnum,
  teachingMaterialsConfigMap,
} from "@oakai/teaching-materials/src/documents/teachingMaterials/configSchema";

import { clerkClient } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { ZodError, z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { teachingMaterialUserBasedRateLimitProcedure } from "../middleware/rateLimiter";
import { router } from "../trpc";
import { buildTransformedLesson } from "./owaLesson/build";
import { fetchOwaLessonAndTcp } from "./owaLesson/fetch";
import { prepareAndCheckRestrictions } from "./owaLesson/prepare";
import {
  generatePartialLessonPlan,
  generateTeachingMaterial,
  validateCurriculumApiEnv,
} from "./teachingMaterials/helpers";

const log = aiLogger("additional-materials");

export const teachingMaterialsRouter = router({
  handleFetchOwaLesson: protectedProcedure
    .input(
      z.object({
        lessonSlug: z.string(),
        programmeSlug: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      log.info("Fetching OWA lesson overview", {
        lessonSlug: input.lessonSlug,
        programmeSlug: input.programmeSlug,
        userId: ctx.auth.userId,
      });

      const { authKey, authType, graphqlEndpoint } = validateCurriculumApiEnv();

      if (!ctx.auth.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      try {
        // Fetch
        const { lessonData, tcpData, isCanonicalLesson } =
          await fetchOwaLessonAndTcp({
            lessonSlug: input.lessonSlug,
            programmeSlug: input.programmeSlug,
            authKey,
            authType,
            graphqlEndpoint: String(graphqlEndpoint),
          });

        // Restrictions
        const {
          parsedLesson,
          parsedBrowseData,
          pathways,
          browseDataUnits,
          hasRestrictedWorks,
          hasRestrictedTranscript,
        } = prepareAndCheckRestrictions({
          lessonData,
          tcpData,
          isCanonicalLesson,
        });

        // Transform
        const lesson = buildTransformedLesson({
          parsedLesson,
          parsedBrowseData,
          pathways,
          browseDataUnits,
          hasRestrictedWorks,
          hasRestrictedTranscript,
        });

        // Persist and return
        const interaction =
          await ctx.prisma.additionalMaterialInteraction.create({
            data: {
              userId: ctx.auth.userId,
              config: {
                resourceType: "partial-lesson-plan-owa",
                resourceTypeVersion: 1,
              },
              output: lesson,
            },
          });

        return {
          lesson: {
            ...lesson,
            lessonId: interaction.id,
          },
        };
      } catch (error) {
        log.error("Error fetching OWA lesson", { error });
        Sentry.captureException(error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch lesson data",
        });
      }
    }),
  createMaterialSession: protectedProcedure
    .input(
      z.object({
        documentType: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      log.info("Creating material session", {
        documentType: input.documentType,
      });

      try {
        if (!ctx.auth.userId) {
          throw new Error("No user id");
        }

        const clerkUser = await clerkClient.users.getUser(ctx.auth.userId);
        if (clerkUser.banned) {
          throw new UserBannedError(ctx.auth.userId);
        }

        const parsedDocType = teachingMaterialTypeEnum.parse(
          input.documentType,
        );
        const version = teachingMaterialsConfigMap[parsedDocType]?.version;

        if (!version) {
          throw new Error(`Unknown document type: ${input.documentType}`);
        }

        const interaction =
          await ctx.prisma.additionalMaterialInteraction.create({
            data: {
              userId: ctx.auth.userId,
              config: {
                resourceType: parsedDocType,
                resourceTypeVersion: version,
              },
            },
          });

        log.info("Material session created", { resourceId: interaction.id });
        return { resourceId: interaction.id };
      } catch (cause) {
        const trpcError = new Error("Failed to create material session", {
          cause,
        });
        log.error("Failed to create material session", cause);
        Sentry.captureException(trpcError);
        throw trpcError;
      }
    }),

  updateMaterialSession: protectedProcedure
    .input(
      z.object({
        resourceId: z.string(),
        lessonId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      log.info("Updating material session", {
        resourceId: input.resourceId,
        lessonId: input.lessonId,
      });

      try {
        if (!ctx.auth.userId) {
          throw new Error("No user id");
        }

        const clerkUser = await clerkClient.users.getUser(ctx.auth.userId);
        if (clerkUser.banned) {
          throw new UserBannedError(ctx.auth.userId);
        }

        await ctx.prisma.additionalMaterialInteraction.update({
          where: {
            id: input.resourceId,
            userId: ctx.auth.userId,
          },
          data: {
            derivedFromId: input.lessonId,
          },
        });

        log.info("Material session updated", { resourceId: input.resourceId });
        return { success: true };
      } catch (cause) {
        const TrpcError = new Error("Failed to update material session", {
          cause,
        });
        log.error("Failed to update material session", cause);
        Sentry.captureException(TrpcError);
        throw TrpcError;
      }
    }),

  generateTeachingMaterial: teachingMaterialUserBasedRateLimitProcedure
    .input(
      z.object({
        context: z.unknown(),
        documentType: z.string(),
        resourceId: z.string().nullish(),
        adaptsOutputId: z.string().nullish(),
        lessonId: z.string().nullish(),
        source: z.enum(["aila", "owa"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      log.info("fetching additional materials");

      try {
        if (!ctx.auth.userId) {
          throw new Error("No user id");
        }
        const clerkUser = await clerkClient.users.getUser(ctx.auth.userId);
        const isDemoUser = demoUsers.isDemoUser(clerkUser);
        isDemoUser &&
          (await rateLimits.teachingMaterialSessions.demo.check(
            ctx.auth.userId,
          ));

        if (clerkUser.banned) {
          throw new UserBannedError(ctx.auth.userId);
        }
      } catch (err) {
        if (err instanceof RateLimitExceededError) {
          const timeRemainingHours = Math.ceil(
            (err.reset - Date.now()) / 1000 / 60 / 60,
          );
          const hours = timeRemainingHours === 1 ? "hour" : "hours";

          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `RateLimitExceededError: **Unfortunately you’ve exceeded your fair usage limit for today.** Please come back in ${timeRemainingHours} ${hours}. If you require a higher limit, please [make a request](${process.env.RATELIMIT_FORM_URL}).`,
            cause: err,
          });
        }
        if (err instanceof UserBannedError) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "UserBannedError: You account has been locked.",
            cause: err,
          });
        }
        throw err;
      }

      try {
        const parsedInput =
          generateTeachingMaterialInputSchema.safeParse(input);
        if (!parsedInput.success) {
          log.error("Failed to parse input", parsedInput.error);
          throw new ZodError(parsedInput.error.issues);
        }

        return await generateTeachingMaterial({
          prisma: ctx.prisma,
          userId: ctx.auth.userId,
          input: parsedInput.data,
          auth: ctx.auth,
          rateLimit: ctx.rateLimit,
        });
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

  generatePartialLessonPlanObject: teachingMaterialUserBasedRateLimitProcedure
    .input(partialLessonContextSchema)
    .mutation(async ({ ctx, input }) => {
      log.info("Generate partial lesson plan", input);
      const parsedInput = partialLessonContextSchema.safeParse(input);
      if (!parsedInput.success) {
        log.error("Failed to parse input", parsedInput.error);
        throw new ZodError(parsedInput.error.issues);
      }

      try {
        if (!ctx.auth.userId) {
          throw new Error("No user id");
        }
        const clerkUser = await clerkClient.users.getUser(ctx.auth.userId);
        const isDemoUser = demoUsers.isDemoUser(clerkUser);
        isDemoUser &&
          (await rateLimits.teachingMaterialSessions.demo.check(
            ctx.auth.userId,
          ));
        if (clerkUser.banned) {
          throw new UserBannedError(ctx.auth.userId);
        }
      } catch (err) {
        if (err instanceof RateLimitExceededError) {
          const timeRemainingHours = Math.ceil(
            (err.reset - Date.now()) / 1000 / 60 / 60,
          );
          const hours = timeRemainingHours === 1 ? "hour" : "hours";
          const errorMessage = `RateLimitExceededError: **Unfortunately you’ve exceeded your fair usage limit for today.** Please come back in ${timeRemainingHours} ${hours}. If you require a higher limit, please [make a request](${process.env.RATELIMIT_FORM_URL}).`;
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: errorMessage,
            cause: { type: "rate_limit", message: errorMessage },
          });
        }
        if (err instanceof TRPCError && err.code === "TOO_MANY_REQUESTS") {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message:
              "RateLimitExceededError: Too many requests, please try again later.",
            cause: err,
          });
        }
        if (err instanceof UserBannedError) {
          const errorMessage = "UserBannedError: User account is locked.";
          throw new TRPCError({
            code: "FORBIDDEN",
            message: errorMessage,
            cause: { type: "banned", message: errorMessage },
          });
        }
        throw err;
      }

      try {
        return await generatePartialLessonPlan({
          prisma: ctx.prisma,
          userId: ctx.auth.userId,
          input: parsedInput.data,
          auth: ctx.auth,
        });
      } catch (cause) {
        if (cause instanceof UserBannedError) {
          const errorMessage = "UserBannedError: User account is locked.";
          throw new TRPCError({
            code: "FORBIDDEN",
            message: errorMessage,
            cause: { type: "banned", message: errorMessage },
          });
        }
        if (cause instanceof RateLimitExceededError) {
          const timeRemainingHours = Math.ceil(
            (cause.reset - Date.now()) / 1000 / 60 / 60,
          );
          const hours = timeRemainingHours === 1 ? "hour" : "hours";

          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `RateLimitExceededError: **Unfortunately you’ve exceeded your fair usage limit for today.** Please come back in ${timeRemainingHours} ${hours}. If you require a higher limit, please [make a request](${process.env.RATELIMIT_FORM_URL}).`,
            cause,
          });
        }

        const errorMessage = `Failed to fetch additional material partial lesson for - ${parsedInput.data.title} - ${parsedInput.data.subject}`;
        log.error(errorMessage, cause);
        Sentry.captureException(cause);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: errorMessage,
          cause: {
            type: "partial_lesson_plan",
            message: errorMessage,
            original: cause,
          },
        });
      }
    }),
  remainingLimit: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;
    const clerkUser = await clerkClient.users.getUser(userId);

    const isDemoUser = demoUsers.isDemoUser(clerkUser);

    if (!isDemoUser) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not a demo user",
      });
    }

    const remaining =
      await rateLimits.teachingMaterialSessions.demo.getRemaining(userId);
    return { remaining };
  }),
});

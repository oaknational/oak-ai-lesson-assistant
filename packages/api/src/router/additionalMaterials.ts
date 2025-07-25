import {
  additionalMaterialTypeEnum,
  additionalMaterialsConfigMap,
  generateAdditionalMaterialInputSchema,
} from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { partialLessonContextSchema } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import { demoUsers } from "@oakai/core";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import { rateLimits } from "@oakai/core/src/utils/rateLimiting";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/errors";
import { aiLogger } from "@oakai/logger";

import { clerkClient } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { ZodError, z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { additionalMaterialUserBasedRateLimitProcedure } from "../middleware/rateLimiter";
import { router } from "../trpc";
import {
  generateAdditionalMaterial,
  generatePartialLessonPlan,
} from "./additionalMaterials/helpers";
import { checkForRestrictedContentGuidance } from "./owaLesson/copyrightHelper";
import {
  lessonOverviewQuery,
  tcpWorksByLessonSlugQuery,
} from "./owaLesson/queries";
import {
  lessonBrowseDataByKsSchema,
  lessonContentSchema,
} from "./owaLesson/schemas";
import { transformOwaLessonToLessonPlan } from "./owaLesson/transformer";
import type {
  LessonOverviewResponse,
  TRPCWorksResponse,
} from "./owaLesson/types";

const log = aiLogger("additional-materials");

export const additionalMaterialsRouter = router({
  fetchOwaLesson: protectedProcedure
    .input(
      z.object({
        lessonSlug: z.string(),
        programmeSlug: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      log.info("Fetching OWA lesson overview", {
        lessonSlug: input.lessonSlug,
        programmeSlug: input.programmeSlug,
        userId: ctx.auth.userId,
      });

      const AUTH_KEY = process.env.CURRICULUM_API_AUTH_KEY;
      const AUTH_TYPE = process.env.CURRICULUM_API_AUTH_TYPE;
      const GRAPHQL_ENDPOINT = process.env.CURRICULUM_API_URL;

      if (!AUTH_KEY || !AUTH_TYPE || !GRAPHQL_ENDPOINT) {
        log.error("Missing environment variables", {
          AUTH_KEY: !!AUTH_KEY,
          AUTH_TYPE: !!AUTH_TYPE,
          GRAPHQL_ENDPOINT: !!GRAPHQL_ENDPOINT,
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Missing required environment variables",
        });
      }

      if (!ctx.auth.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      try {
        // Fetch lesson data
        const lessonResponse = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-oak-auth-key": AUTH_KEY,
            "x-oak-auth-type": AUTH_TYPE,
          },
          body: JSON.stringify({
            query: lessonOverviewQuery,
            variables: {
              lesson_slug: input.lessonSlug,
              programme_slug: input.programmeSlug,
            },
          }),
        });

        if (!lessonResponse.ok) {
          log.error("Failed to fetch lesson data", {
            status: lessonResponse.status,
            statusText: lessonResponse.statusText,
            lessonSlug: input.lessonSlug,
            programmeSlug: input.programmeSlug,
          });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch lesson data from curriculum API",
          });
        }

        // Fetch TCP data
        const tcpResponse = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-oak-auth-key": AUTH_KEY,
            "x-oak-auth-type": AUTH_TYPE,
          },
          body: JSON.stringify({
            query: tcpWorksByLessonSlugQuery,
            variables: {
              lesson_slug: input.lessonSlug,
            },
          }),
        });

        if (!tcpResponse.ok) {
          log.error("Failed to fetch TCP data", {
            status: tcpResponse.status,
            statusText: tcpResponse.statusText,
          });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch TCP data",
          });
        }

        let lessonData: LessonOverviewResponse;
        let tcpData: TRPCWorksResponse;

        try {
          lessonData = await lessonResponse.json();
          tcpData = await tcpResponse.json();
        } catch (jsonError) {
          log.error("Failed to parse API responses", { jsonError });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response format from API",
          });
        }

        // Validate lesson data
        if (
          !lessonData.data?.content?.[0] ||
          !lessonData.data?.browseData?.[0]
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lesson not found",
          });
        }

        const rawLesson = lessonData.data.content[0];
        const parsedLesson = lessonContentSchema.parse(rawLesson);

        const browseDataArray = lessonData.data.browseData;
        const browseData = browseDataArray.find(
          (item) => item.lesson_slug === parsedLesson.lesson_slug,
        );

        if (!browseData) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lesson not found in browse data",
          });
        }

        const parsedBrowseData = lessonBrowseDataByKsSchema.parse(browseData);

        // Check for restricted content
        checkForRestrictedContentGuidance(parsedLesson.content_guidance);
        // checkForRestrictedFeatures(parsedBrowseData);

        // Check for restricted works
        const worksList =
          tcpData.data?.tcpWorksByLessonSlug?.[0]?.works_list ?? [];
        const hasRestrictedWorks = worksList.length > 0;

        // Transform to lesson plan format
        const transformedLesson = transformOwaLessonToLessonPlan(
          parsedLesson,
          parsedBrowseData,
        );

        // Create lesson plan interaction
        const interaction =
          await ctx.prisma.additionalMaterialInteraction.create({
            data: {
              userId: ctx.auth.userId,
              config: {
                resourceType: "partial-lesson-plan-owa",
                resourceTypeVersion: 1,
              },
            },
          });

        return {
          lesson: {
            ...transformedLesson,
            lessonId: interaction.id,
          },
          transcript: !hasRestrictedWorks
            ? rawLesson.transcript_sentences
            : undefined,
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

        const parsedDocType = additionalMaterialTypeEnum.parse(
          input.documentType,
        );
        const version = additionalMaterialsConfigMap[parsedDocType]?.version;

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

  generateAdditionalMaterial: additionalMaterialUserBasedRateLimitProcedure
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
          (await rateLimits.additionalMaterialSessions.demo.check(
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
          generateAdditionalMaterialInputSchema.safeParse(input);
        if (!parsedInput.success) {
          log.error("Failed to parse input", parsedInput.error);
          throw new ZodError(parsedInput.error.issues);
        }

        return await generateAdditionalMaterial({
          prisma: ctx.prisma,
          userId: ctx.auth.userId,
          input: parsedInput.data,
          auth: ctx.auth,
          rateLimit: ctx.rateLimit,
          source: parsedInput.data.source,
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

  generatePartialLessonPlanObject: additionalMaterialUserBasedRateLimitProcedure
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
          (await rateLimits.additionalMaterialSessions.demo.check(
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
      await rateLimits.additionalMaterialSessions.demo.getRemaining(userId);
    return { remaining };
  }),
});

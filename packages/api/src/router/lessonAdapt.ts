import { getPresentation, getSlideThumbnails } from "@oakai/gsuite";
import {
  type SlideContent,
  adaptationPlanSchema,
  coordinateAdaptation,
  extractPresentationContent,
  slideDeckContentSchema,
} from "@oakai/lesson-adapters";
import { aiLogger } from "@oakai/logger";

import { TRPCError } from "@trpc/server";
import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import { z } from "zod";

import { adminProcedure } from "../middleware/adminAuth";
import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";
import {
  type ExtractedLessonData,
  extractLessonDataForAdaptPage,
  extractedLessonDataSchema,
} from "./owaLesson/extractLessonData";
import { fetchOwaLessonAndTcp } from "./owaLesson/fetch";
import {
  duplicateLessonSlideDeck,
  enrichSlidesWithKlpLc,
} from "./owaLesson/slideDeck";
import { validateCurriculumApiEnv } from "./teachingMaterials/helpers";

/**
 * Session state stored in KV for lesson adaptations.
 * Keyed by a generated sessionId.
 */
interface LessonAdaptSession {
  id: string;
  lessonData: ExtractedLessonData;
  slideContent: SlideContent[];
  duplicatedPresentationId: string;
  duplicatedPresentationUrl: string;
  owaLessonSlug: string;
  userId: string;
  createdAt: number;
}

function generateSessionId(): string {
  return nanoid(16);
}

const KV_SESSION_PREFIX = "lesson-adapt:session:";
const SESSION_TTL_SECONDS = 60 * 60; // 1 hour for POC

/**
 * Simple KV storage for lesson adapt sessions.
 * Keyed by sessionId.
 * Will be replaced by db
 */
const LessonAdaptSessionStorage = {
  async store(session: LessonAdaptSession): Promise<void> {
    const key = `${KV_SESSION_PREFIX}${session.id}`;
    await kv.set(key, session, { ex: SESSION_TTL_SECONDS });
  },

  async get(sessionId: string): Promise<LessonAdaptSession | null> {
    const key = `${KV_SESSION_PREFIX}${sessionId}`;
    return kv.get<LessonAdaptSession>(key);
  },
};

const log = aiLogger("adaptations");
/**
 * Lesson Adapt Router
 *
 * Provides endpoints for AI-powered lesson adaptation workflow.
 * Implementation logic will be added in follow-up PR.
 */

const generatePlanInput = z.object({
  sessionId: z.string(),
  userMessage: z.string(),
});

const generatePlanOutput = z.object({
  plan: adaptationPlanSchema,
});

const executeAdaptationsInput = z.object({
  lessonId: z.string(),
  presentationId: z.string(),
  approvedChangeIds: z.array(z.string()),
  planData: z.any(),
});

const executeAdaptationsOutput = z.object({
  success: z.boolean(),
  executedChanges: z.array(z.string()),
  errors: z.array(z.string()).optional(),
});

export const lessonAdaptRouter = router({
  /**
   * Planning Phase: Generate adaptation plan
   * Spawns agent swarm to analyze user request and propose changes
   */
  generatePlan: adminProcedure
    .input(generatePlanInput)
    .output(generatePlanOutput)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.auth.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const { userMessage, sessionId } = input;

      // Retrieve session from KV
      const session = await LessonAdaptSessionStorage.get(sessionId);
      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found. Please reload the lesson.",
        });
      }

      log.info("Retrieved session from KV", {
        sessionId,
        owaLessonSlug: session.owaLessonSlug,
      });

      // 1. Classify edit type
      const coordinateAdaptationResult = await coordinateAdaptation({
        userMessage,
        slideDeck: {
          slides: session.slideContent,
          lessonTitle: session.lessonData.title,
          slideDeckId: session.duplicatedPresentationId,
        },
      });

      // Session data available for next steps:
      // - session.lessonData (extracted lesson metadata)
      // - session.slideContent (LLM-friendly slide content)

      // TODO: Implement in follow-up PR
      // 2. Use session.slideContent + session.lessonData for agent context
      // 3. Spawn agents (KLP, Slides, Pedagogy Validator)
      // 4. Coordinator aggregates and returns unified plan

      if (!coordinateAdaptationResult.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Adaptation planning failed: ${coordinateAdaptationResult.reason}`,
        });
      }

      log.info("Adaptation plan generated", {
        sessionId,
        owaLessonSlug: session.owaLessonSlug,
      });

      return {
        plan: coordinateAdaptationResult.plan,
      };
    }),

  /**
   * Execution Phase: Apply approved changes
   * Executes changes via Google Slides API and Apps Script
   */
  executeAdaptations: adminProcedure
    .input(executeAdaptationsInput)
    .output(executeAdaptationsOutput)
    .mutation(async () => {
      // TODO: Implement in follow-up PR
      // 1. Filter changes by approved IDs
      // 2. Execute via Google Slides API (text, deletions)
      // 3. Execute via Apps Script (autofit, templates)
      // 4. Update KLP array if needed
      // 5. Return execution results
      throw new Error("Not implemented yet");
    }),

  /**
   * Fetch lesson content with all resources
   * Also creates a copy of the slide deck for adaptation
   */
  getLessonContent: adminProcedure
    .input(
      z.object({
        lessonSlug: z.string(),
      }),
    )
    .output(
      z.object({
        sessionId: z.string(),
        lessonData: extractedLessonDataSchema,
        duplicatedPresentationId: z.string(),
        duplicatedPresentationUrl: z.string().url(),
        slideContent: slideDeckContentSchema,
        /** Raw Google Slides API response (for debugging) */
        rawSlideData: z.any(),
        rawLessonData: z.any(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.auth.userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }
        // NOTE: Database structure for lesson adaptations not yet set up

        const { lessonSlug } = input;
        const programmeSlug = null; // Canonical lesson for now

        const { authKey, authType, graphqlEndpoint } =
          validateCurriculumApiEnv();

        // Fetch lesson data from OWA
        const { lessonData } = await fetchOwaLessonAndTcp({
          lessonSlug,
          programmeSlug,
          authKey,
          authType,
          graphqlEndpoint: String(graphqlEndpoint),
        });

        // Duplicate the slide deck to the configured folder
        const { duplicatedPresentationId, duplicatedPresentationUrl } =
          await duplicateLessonSlideDeck(lessonData, lessonSlug);

        const presentation = await getPresentation(duplicatedPresentationId);
        const slideDeck = extractPresentationContent(presentation);

        // Extract and transform into useful lesson data from google api json
        const extractedLessonData = extractLessonDataForAdaptPage(lessonData);

        // Analyze slides to identify key learning points and learning cycles covered on each slide
        const enrichedSlides = await enrichSlidesWithKlpLc(
          slideDeck.slides,
          extractedLessonData.keyLearningPoints,
          extractedLessonData.learningCycles,
        );

        // Generate a unique session ID
        const sessionId = generateSessionId();

        // Store session in KV for later retrieval by generatePlan
        await LessonAdaptSessionStorage.store({
          id: sessionId,
          lessonData: extractedLessonData,
          slideContent: enrichedSlides,
          duplicatedPresentationId,
          duplicatedPresentationUrl,
          owaLessonSlug: lessonSlug,
          userId: ctx.auth.userId,
          createdAt: Date.now(),
        });

        return {
          sessionId,
          lessonData: extractedLessonData,
          duplicatedPresentationId,
          duplicatedPresentationUrl,
          slideContent: {
            ...slideDeck,
            slides: enrichedSlides,
          },
          rawSlideData: presentation,
          rawLessonData: lessonData,
        };
      } catch (error) {
        log.error("Failed to fetch lesson content", {
          lessonSlug: input.lessonSlug,
          error,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch lesson content",
          cause: error,
        });
      }
    }),

  /**
   * Fetch slide thumbnails for a presentation
   * Uses batching with rate limiting to avoid Google API limits
   */
  getSlideThumbnails: adminProcedure
    .input(
      z.object({
        presentationId: z.string(),
      }),
    )
    .output(
      z.object({
        thumbnails: z.array(
          z.object({
            objectId: z.string(),
            slideIndex: z.number(),
            thumbnailUrl: z.string(),
            width: z.number(),
            height: z.number(),
          }),
        ),
      }),
    )
    .query(async ({ input }) => {
      try {
        const thumbnails = await getSlideThumbnails(input.presentationId);

        return { thumbnails };
      } catch (error) {
        log.error("Failed to fetch slide thumbnails", {
          presentationId: input.presentationId,
          error,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch slide thumbnails",
          cause: error,
        });
      }
    }),

  /**
   * Get history of adaptations for a lesson
   */
  getAdaptationHistory: protectedProcedure
    .input(
      z.object({
        lessonId: z.string(),
      }),
    )
    .query(async () => {
      // TODO: Implement in follow-up PR
      // Query adaptation history from database
      throw new Error("Not implemented yet");
    }),
});

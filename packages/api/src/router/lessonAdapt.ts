import { getPresentation } from "@oakai/gsuite";
import { extractPresentationContent } from "@oakai/lesson-adapters";
import { aiLogger } from "@oakai/logger";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";
import { fetchOwaLessonAndTcp } from "./owaLesson/fetch";
import { duplicateLessonSlideDeck } from "./owaLesson/slideDeck";
import { validateCurriculumApiEnv } from "./teachingMaterials/helpers";

const log = aiLogger("adaptations");
/**
 * Lesson Adapt Router
 *
 * Provides endpoints for AI-powered lesson adaptation workflow.
 * Implementation logic will be added in follow-up PR.
 */

const generatePlanInput = z.object({
  lessonId: z.string(),
  presentationId: z.string(),
  userMessage: z.string(),
});

const generatePlanOutput = z.object({
  plan: z.object({
    changes: z.array(
      z.object({
        id: z.string(),
        type: z.string(),
        description: z.string(),
      }),
    ),
    warnings: z.array(z.string()).optional(),
  }),
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
  generatePlan: protectedProcedure
    .input(generatePlanInput)
    .output(generatePlanOutput)
    .mutation(async () => {
      // TODO: Implement in follow-up PR
      // 1. Classify edit type
      // 2. Fetch presentation and convert to LLM format
      // 3. Spawn agents (KLP, Slides, Pedagogy Validator)
      // 4. Coordinator aggregates and returns unified plan
      throw new Error("Not implemented yet");
    }),

  /**
   * Execution Phase: Apply approved changes
   * Executes changes via Google Slides API and Apps Script
   */
  executeAdaptations: protectedProcedure
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
  getLessonContent: protectedProcedure
    .input(
      z.object({
        lessonId: z.string(),
      }),
    )
    .output(
      z.object({
        lessonData: z.any(),
        presentationId: z.string(),
        presentationUrl: z.string().url(),
        slideContent: z.any(), // PresentationContent type
        /** Raw Google Slides API response (for debugging) */
        rawSlideData: z.any(),
      }),
    )
    .query(async ({ input }) => {
      try {
        // NOTE: Database structure for lesson adaptations not yet set up

        // Temporary: Treat lessonId as lessonSlug for now
        const lessonSlug = input.lessonId;
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
        const { presentationId, presentationUrl } =
          await duplicateLessonSlideDeck(lessonData, lessonSlug);

        // Extract slide content in LLM-friendly format
        const presentation = await getPresentation(presentationId);
        const slideContent = extractPresentationContent(presentation);

        return {
          lessonData,
          presentationId,
          presentationUrl,
          slideContent,
        };
      } catch (error) {
        log.error("Failed to fetch lesson content", {
          lessonId: input.lessonId,
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

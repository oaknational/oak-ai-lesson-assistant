import { aiLogger } from "@oakai/logger";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";
import { fetchOwaLessonAndTcp } from "./owaLesson/fetch";
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
   */
  getLessonContent: protectedProcedure
    .input(
      z.object({
        lessonId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        // NOTE: Database structure for lesson adaptations not yet set up
        // When implemented, this should query a table to get the lessonSlug from lessonId
        // TODO: Replace with actual database query: const lessonRecord = await ctx.prisma.lessonAdaptation.findUnique(...)

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

        return {
          lessonData,
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

import { aiLogger } from "@oakai/logger";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { lessonAdaptApiDataSchema } from "./schemas";
import { transformKeywords, transformMisconceptions } from "./transformer";
import type { LessonOverviewResponse } from "./types";

const logger = aiLogger("lessons");

/**
 * Schema for extracted lesson details displayed on the adapt page
 */
export const extractedLessonDataSchema = z.object({
  keyStage: z.string(),
  subject: z.string(),
  title: z.string(),
  learningOutcome: z.string(),
  learningCycles: z.array(z.string()),
  keyLearningPoints: z.array(z.string()),
  keywords: z.array(
    z.object({
      keyword: z.string(),
      definition: z.string(),
    }),
  ),
  misconceptions: z.array(
    z.object({
      misconception: z.string(),
      description: z.string(),
    }),
  ),
});

export type ExtractedLessonData = z.infer<typeof extractedLessonDataSchema>;

/**
 * Helper function to extract relevant lesson data for the adapt page
 * Validates and maps OWA API fields to our frontend data structure
 */
export function extractLessonDataForAdaptPage(
  lessonResponse: LessonOverviewResponse,
): ExtractedLessonData {
  // Validate the incoming data structure using our schema
  const validationResult = lessonAdaptApiDataSchema.safeParse(lessonResponse);
  logger.info("Validation result:", JSON.stringify(validationResult, null, 2));

  if (!validationResult.success) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Invalid lesson data structure from API",
      cause: validationResult.error,
    });
  }

  const validatedData = validationResult.data;
  // Schema guarantees at least 1 item in each array via .min(1)
  const lessonData = validatedData.data.content[0]!;
  const browseData = validatedData.data.browseData[0]!;

  // Extract learning cycles from lesson_outline
  // lesson_outline is an array of objects with shape: { lesson_outline: string }
  const learningCycles = (browseData.lesson_data.lesson_outline ?? []).map(
    (item) => item.lesson_outline,
  );

  // Extract key learning points
  const keyLearningPoints = (lessonData.key_learning_points ?? []).map(
    (item) => item.key_learning_point,
  );

  return extractedLessonDataSchema.parse({
    keyStage: browseData.programme_fields?.keystage,
    subject: browseData.programme_fields?.subject,
    title: lessonData.lesson_title,
    learningOutcome: lessonData.pupil_lesson_outcome,
    learningCycles,
    keyLearningPoints,
    keywords: transformKeywords(lessonData.lesson_keywords ?? []),
    misconceptions: transformMisconceptions(
      lessonData.misconceptions_and_common_mistakes ?? [],
    ),
  });
}

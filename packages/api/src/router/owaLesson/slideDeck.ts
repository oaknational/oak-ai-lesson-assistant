import { duplicateSlideDeckToDefaultFolder } from "@oakai/gsuite";
import {
  type SlideContent,
  analyseKlpLearningCycles,
} from "@oakai/lesson-adapters";
import { aiLogger } from "@oakai/logger";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { LessonOverviewResponse } from "./types";

const log = aiLogger("adaptations");

/**
 * Duplicates a lesson's slide deck to a Google Drive folder
 * @param lessonData - OWA lesson data containing slide deck URL
 * @param lessonSlug - Lesson slug for logging and fallback title
 * @returns Presentation ID and URL of the duplicated slide deck
 * @throws TRPCError if lesson has no slide deck or duplication fails
 */
export async function duplicateLessonSlideDeck(
  lessonData: LessonOverviewResponse,
  lessonSlug: string,
): Promise<{
  duplicatedPresentationId: string;
  duplicatedPresentationUrl: string;
}> {
  const lessonContent = lessonData.data?.content?.[0];

  // Extract and validate slide deck URL from lesson data
  const slideDeckUrl = z
    .string()
    .parse(lessonContent?.slide_deck_asset_object_url);

  if (!slideDeckUrl) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Lesson does not have a slide deck",
    });
  }

  try {
    // Duplicate the slide deck to the configured folder
    const lessonTitle = lessonContent?.lesson_title ?? lessonSlug;
    const duplicateResult = await duplicateSlideDeckToDefaultFolder(
      slideDeckUrl,
      `${String(lessonTitle)} - Adapted`,
    );

    log.info("Successfully duplicated slide deck", {
      lessonSlug,
      originalUrl: slideDeckUrl,
      presentationId: duplicateResult.presentationId,
      presentationUrl: duplicateResult.presentationUrl,
    });

    return {
      duplicatedPresentationId: duplicateResult.presentationId,
      duplicatedPresentationUrl: duplicateResult.presentationUrl,
    };
  } catch (error) {
    log.error("Failed to duplicate slide deck", {
      lessonSlug,
      slideDeckUrl,
      error,
    });

    // Provide helpful error message based on the error
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Generic error fallback
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to duplicate slide deck: ${errorMessage}`,
      cause: error,
    });
  }
}

/**
 * Enriches slide content with key learning points and learning cycles mappings
 * Uses AI agent to analyze which KLPs and learning cycles are covered on each slide
 *
 * @param slides - Array of slide content to analyze
 * @param keyLearningPoints - Key learning points from the lesson
 * @param learningCycles - Learning cycles from the lesson outline
 * @returns Array of slides enriched with KLP and learning cycle mappings
 */
export async function enrichSlidesWithKlpLc(
  slides: SlideContent[],
  keyLearningPoints: string[],
  learningCycles: string[],
): Promise<SlideContent[]> {
  log.info("Enriching slides with KLP/LC mappings", {
    slideCount: slides.length,
    klpCount: keyLearningPoints.length,
    lcCount: learningCycles.length,
  });

  const klpLcAnalysis = await analyseKlpLearningCycles({
    slides,
    keyLearningPoints,
    learningCycles,
  });

  // Enrich slide content with KLP and learning cycle mappings
  const enrichedSlides: SlideContent[] = slides.map((slide) => {
    const mapping = klpLcAnalysis.slideMappings.find(
      (m) => m.slideNumber === slide.slideNumber,
    );
    return {
      ...slide,
      keyLearningPoints: mapping?.keyLearningPoints ?? [],
      learningCycles: mapping?.learningCycles ?? [],
      slideType: mapping?.slideType,
    };
  });

  log.info("KLP/LC enrichment complete", {
    totalMappings: klpLcAnalysis.slideMappings.length,
  });

  return enrichedSlides;
}

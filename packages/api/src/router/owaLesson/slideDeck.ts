import { duplicateSlideDeckToDefaultFolder } from "@oakai/gsuite";
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

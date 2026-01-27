import type { GoogleSlidesPresentation } from "@oakai/gsuite";

import { extractSlideContent } from "./extractSlideContent";
import type { SlideDeckContent, SlideContent } from "./types";

/**
 * Extracts all content from a Google Slides presentation
 *
 * This transforms raw Google Slides API data into a format
 * optimized for LLM comprehension with:
 * - Text elements with IDs
 * - Table cells with composite IDs for reference
 * - Non-text element summaries
 *
 * @param presentation - Raw presentation data from Google Slides API
 * @returns Extracted and structured content ready for LLM consumption
 *
 * @example
 * ```typescript
 * import { getPresentation } from '@oakai/gsuite';
 *
 * const raw = await getPresentation('abc123xyz');
 * const content = extractPresentationContent(raw);
 * console.log(content.lessonTitle);
 * console.log('Slide count:', content.slides.length);
 * ```
 */
export function extractPresentationContent(
  presentation: GoogleSlidesPresentation,
): SlideDeckContent {
  const slideDeckId = presentation.presentationId ?? "";
  const lessonTitle = presentation.title ?? "Untitled Presentation";
  const layouts = presentation.layouts;

  const slides: SlideContent[] = [];

  presentation.slides?.forEach((slide, index) => {
    const extractedSlide = extractSlideContent(slide, index + 1, layouts);

    // Only include slides that have some content
    if (
      extractedSlide.textElements.length > 0 ||
      extractedSlide.tables.length > 0 ||
      extractedSlide.nonTextElements.length > 0
    ) {
      slides.push(extractedSlide);
    }
  });

  return {
    slideDeckId,
    lessonTitle,
    slides,
  };
}

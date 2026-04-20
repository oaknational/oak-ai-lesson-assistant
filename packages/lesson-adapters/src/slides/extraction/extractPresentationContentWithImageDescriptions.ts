import type { GoogleSlidesPresentation } from "@oakai/gsuite";

import { extractPresentationContent } from "./extractPresentationContent";
import { generateImageDescriptions } from "./generateImageDescriptions";
import type { SlideDeckContent } from "./types";

/**
 * Extracts presentation content and enriches image elements with
 * AI-generated descriptions via GPT-4o Vision.
 *
 * Wraps `extractPresentationContent` (pure/sync) with an async step that
 * collects image contentUrls from the raw API data, generates descriptions
 * in parallel, and patches them back into the returned slide deck.
 */
export async function extractPresentationContentWithImageDescriptions(
  presentation: GoogleSlidesPresentation,
): Promise<SlideDeckContent> {
  const slideDeck = extractPresentationContent(presentation);

  const imagesToDescribe: Array<{
    objectId: string;
    contentUrl: string;
    title?: string;
  }> = [];

  presentation.slides?.forEach((slide) => {
    slide.pageElements?.forEach((element) => {
      if (element.objectId && element.image?.contentUrl) {
        imagesToDescribe.push({
          objectId: element.objectId,
          contentUrl: element.image.contentUrl,
          title: element.title ?? undefined,
        });
      }
    });
  });

  const imageDescriptions = await generateImageDescriptions(
    imagesToDescribe,
    slideDeck.lessonTitle,
  );

  slideDeck.slides.forEach((slide) => {
    slide.nonTextElements.forEach((el) => {
      if (el.type === "image" && imageDescriptions[el.id]) {
        el.description = imageDescriptions[el.id]!;
      }
    });
  });

  return slideDeck;
}

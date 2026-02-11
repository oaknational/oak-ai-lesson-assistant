import type { GoogleSlidesPage } from "@oakai/gsuite";

import { classifyNonTextElement } from "./classifyNonTextElement";
import { extractSlideTitle } from "./extractSlideTitle";
import { extractTableCells } from "./extractTableCells";
import { extractTextFromTextElements } from "./extractTextFromTextElements";
import type {
  SlideContent,
  SlideNonTextElement,
  SlideTable,
  SlideTextElement,
} from "./types";

/**
 * Extracts all content from a single slide
 *
 * @param slide - The slide page to process
 * @param slideNumber - 1-based slide number
 * @param layouts - All layout pages from the presentation
 * @returns Extracted slide data
 */
export function extractSlideContent(
  slide: GoogleSlidesPage,
  slideNumber: number,
  layouts: GoogleSlidesPage[] | undefined,
): SlideContent {
  const textElements: SlideTextElement[] = [];
  const tables: SlideTable[] = [];
  const nonTextElements: SlideNonTextElement[] = [];

  const layoutObjectId = slide.slideProperties?.layoutObjectId;

  const slideLayout = layouts?.find((l) => l.objectId === layoutObjectId);
  const layoutName = slideLayout?.layoutProperties?.displayName ?? undefined;

  if (layoutObjectId) {
    slideLayout?.pageElements?.forEach((element) => {
      if (!element.objectId) {
        return;
      }
      if (element.shape?.text) {
        const content = extractTextFromTextElements(
          element.shape.text.textElements,
        );
        if (content) {
          textElements.push({
            id: element.objectId,
            content,
            layoutObjectId: layoutObjectId,
            placeholderType: element.shape.placeholder?.type ?? "TITLE",
            placeholderIndex: element.shape.placeholder?.index ?? undefined,
          });
        }
      }
    });
  }

  slide.pageElements?.forEach((element) => {
    if (!element.objectId) {
      return;
    }

    // Extract text elements (shapes with text)
    if (element.shape?.text) {
      const content = extractTextFromTextElements(
        element.shape.text.textElements,
      );

      if (content) {
        textElements.push({
          id: element.objectId,
          content,
          placeholderType: element.shape.placeholder?.type ?? undefined,
          placeholderIndex: element.shape.placeholder?.index ?? undefined,
        });
      }
    } else {
      // Classify non-text elements
      const { type, description } = classifyNonTextElement(element);
      nonTextElements.push({
        id: element.objectId,
        type,
        description,
      });
    }

    // Extract table data separately (tables are also tracked in nonTextElements)
    if (element.table) {
      const rows = element.table.rows ?? 0;
      const columns = element.table.columns ?? 0;
      const cells = extractTableCells(element.objectId, element.table);

      tables.push({
        id: element.objectId,
        rows,
        columns,
        cells,
      });
    }
  });

  const { slideTitle } = extractSlideTitle(textElements, layoutName);

  return {
    slideNumber,
    slideId: slide.objectId ?? "",
    slideTitle,
    layoutName,
    textElements,
    tables,
    nonTextElements,
    slideType: "unknown",
  };
}

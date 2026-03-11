import type { SlideContent } from "../../slides/extraction/types";
import type { SimplifiedSlideContent } from "../utils";
import type { SlideField } from "./intents";

// ---------------------------------------------------------------------------
// Slide Content Filtering
// ---------------------------------------------------------------------------

/**
 * Filters slide content based on the intent's slideFields config.
 */
export function filterSlideContent(
  slides: SlideContent[],
  fields: SlideField[],
): SimplifiedSlideContent[] {
  return slides.map((slide) => {
    const filtered: SimplifiedSlideContent = {
      slideNumber: slide.slideNumber,
      slideId: slide.slideId,
      slideTitle: slide.slideTitle,
      slideType: slide.slideType,
      coversDiversity: slide.coversDiversity,
    };

    if (fields.includes("textElements")) {
      filtered.textElements = slide.textElements;
    }
    if (fields.includes("tables")) {
      filtered.tables = slide.tables;
    }
    if (fields.includes("images")) {
      filtered.images = slide.nonTextElements
        .filter((el) => el.type === "image")
        .map((el) => ({ id: el.id, description: el.description }));
    }
    if (fields.includes("shapes")) {
      filtered.shapes = slide.nonTextElements
        .filter((el) => el.type === "shape")
        .map((el) => ({ id: el.id, description: el.description }));
    }
    if (fields.includes("keyLearningPoints")) {
      filtered.keyLearningPoints = slide.keyLearningPoints;
    }
    if (fields.includes("learningCycles")) {
      filtered.learningCycles = slide.learningCycles;
    }

    return filtered;
  });
}

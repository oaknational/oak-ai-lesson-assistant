import type { SlideTextElement } from "./types";

const CENTERED_TITLE = "CENTERED_TITLE";

/**
 * Extracts the slide title from text elements
 *
 * Title extraction priority:
 * 1. CENTERED_TITLE placeholder if found
 * 2. Concatenated titles if exactly two TITLE placeholders exist
 * 3. Layout name if more than two TITLE placeholders exist
 * 4. Single TITLE placeholder content if exactly one exists
 * 5. undefined if no TITLE placeholder found
 *
 * @param textElements - Extracted text elements from the slide
 * @param layoutName - Optional layout name to use as fallback
 * @returns Object containing slideTitle (may be undefined)
 */
export function extractSlideTitle(
  textElements: SlideTextElement[],
  layoutName: string | undefined,
): {
  slideTitle: string | undefined;
} {
  const possibleSlideTitles = textElements.filter(
    (el) => el.placeholderType === "TITLE",
  );

  // Check for CENTERED_TITLE placeholder
  const centeredTitle = possibleSlideTitles.find(
    (el) => el.content === CENTERED_TITLE,
  );
  if (centeredTitle) {
    return { slideTitle: centeredTitle.content };
  }

  // More than two titles: use layout name
  if (possibleSlideTitles.length > 2) {
    return { slideTitle: layoutName };
  }

  // Exactly two titles: concatenate them
  if (possibleSlideTitles.length === 2) {
    const title1 = possibleSlideTitles[0]?.content ?? "";
    const title2 = possibleSlideTitles[1]?.content ?? "";
    const concatenated = [title1, title2].filter(Boolean).join(" - ");
    return { slideTitle: concatenated || undefined };
  }

  // Exactly one title: use it
  if (possibleSlideTitles.length === 1) {
    return { slideTitle: possibleSlideTitles[0]?.content };
  }

  // No titles found
  return { slideTitle: textElements[0]?.content };
}

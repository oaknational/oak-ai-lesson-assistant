import type { GoogleSlidesTextElement } from "@oakai/gsuite";

import { isTruthy } from "remeda";

/**
 * Extracts text content from Google Slides text elements
 *
 * Text in Google Slides is stored as an array of text elements,
 * each containing a text run with the actual content.
 *
 * @param textElements - Array of text elements from a shape
 * @returns Concatenated text content
 */
export function extractTextFromTextElements(
  textElements: GoogleSlidesTextElement[] | undefined,
): string | undefined {
  if (!textElements) {
    return undefined;
  }

  const textRunContent = textElements.map((el) =>
    typeof el.textRun?.content === "string" ? el.textRun.content : null,
  );

  const text = textRunContent.filter(isTruthy).join("");
  return text.length > 0 ? text.trim() : undefined;
}

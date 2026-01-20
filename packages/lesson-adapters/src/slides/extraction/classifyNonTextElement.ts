import type { GoogleSlidesPageElement } from "@oakai/gsuite";

import type { NonTextElementType } from "./types";

/**
 * Classifies a non-text page element
 *
 * Uses Google's native type values
 * The `title` property on PageElement is the alt text if set.
 *
 * @param element - The page element to classify
 * @returns Object with type and description
 */
export function classifyNonTextElement(element: GoogleSlidesPageElement): {
  type: NonTextElementType;
  description: string;
} {
  // element.title is the alt text on the PageElement (valid for all types)
  const altText = element.title ?? undefined;

  if (element.shape) {
    // Use Google's raw shapeType directly (e.g., RECTANGLE, TEXT_BOX, ELLIPSE)
    const shapeType = element.shape.shapeType ?? "SHAPE";
    return { type: "shape", description: altText ?? shapeType };
  }

  if (element.image) {
    return { type: "image", description: altText ?? "image" };
  }

  if (element.video) {
    return { type: "video", description: altText ?? "video" };
  }

  if (element.table) {
    const rows = element.table.rows ?? 0;
    const cols = element.table.columns ?? 0;
    return { type: "table", description: altText ?? `${rows}x${cols}` };
  }

  if (element.line) {
    // Use Google's lineType if available (e.g., STRAIGHT_LINE, CURVED)
    const lineType = element.line.lineType ?? "line";
    return { type: "line", description: altText ?? lineType };
  }

  if (element.elementGroup) {
    return { type: "diagram", description: altText ?? "element_group" };
  }

  return { type: "unknown", description: altText ?? "unknown" };
}

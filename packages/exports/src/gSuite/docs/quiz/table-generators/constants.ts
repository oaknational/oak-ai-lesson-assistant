/**
 * Constants for quiz table generation
 */

// Standard column widths in points
export const COLUMN_WIDTHS = {
  checkbox: 29, // 21pt for image + spacing on right
  letter: 21,
  spacer: 10,
  textNarrow: 140,
  imageColumn: 130, // Fixed width for image columns in 4-column layout
  auto: "AUTO", // Special value for auto-width columns
} as const;

// Answer box dimensions and URL
export const ANSWER_BOX_SIZE = 28; // Base size in pixels (1x dimensions)
export const ANSWER_BOX_IMAGE_URL = `https://storage.googleapis.com/${process.env.GCS_LATEX_BUCKET_NAME}/static/answer-box.png`;

// Unicode characters
export const CHECKBOX_PLACEHOLDER = "☐";

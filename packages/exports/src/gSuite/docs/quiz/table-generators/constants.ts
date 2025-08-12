/**
 * Constants for quiz table generation
 */

// Standard column widths in points
export const COLUMN_WIDTHS = {
  checkbox: 32, // 21pt for image + spacing on right
  letter: 18, // Reduced to minimize space after letter
  spacer: 10,
  textNarrow: 140,
  textWide: 400,
  textFull: 430, // Slightly wider to compensate
} as const;

// Answer box dimensions and URL
export const ANSWER_BOX_SIZE = 28; // Base size in pixels (1x dimensions)
export const ANSWER_BOX_IMAGE_URL = `https://storage.googleapis.com/${process.env.GCS_LATEX_BUCKET_NAME}/static/answer-box.png`;

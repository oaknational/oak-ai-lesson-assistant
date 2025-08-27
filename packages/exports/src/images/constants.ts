/**
 * Shared constants for image processing and dimension calculations
 */

/**
 * DPI scaling factor for PNG generation - affects resolution, not visual size.
 * Current value of 3.0 produces ~288 DPI images (assuming 96 DPI base).
 * This gets divided out in getGoogleDocsDimensions() so visual size stays the same.
 */
export const DPI_SCALE_FACTOR = 3.0;

/**
 * Visual scaling factor for LaTeX images - makes them appear larger in documents.
 * This does NOT get divided out, so it actually makes the images visually bigger.
 * 2.0 = twice as large, 1.5 = 50% larger, etc.
 */
export const LATEX_VISUAL_SCALE = 1.3;

/**
 * Visual scaling factor for Oak curriculum images - makes them appear smaller.
 * Oak images tend to be too large, so we scale them down.
 * 0.5 = half size, 0.25 = quarter size, etc.
 */
export const STEM_IMAGE_SCALE = 0.5;

/**
 * Whether to render LaTeX expressions in bold
 */
export const LATEX_USE_BOLD = false;

/**
 * Convert pixels to points for Google Docs dimensions.
 * Google Docs uses points (pt) for measurements where 1px = 0.75pt
 *
 * @param pixels - Width or height in pixels
 * @returns Equivalent value in points
 */
export function pxToPt(pixels: number): number {
  return pixels * 0.75;
}

/**
 * Calculate Google Docs dimensions from DPI-scaled pixel values.
 * Takes pixel dimensions that were scaled up during PNG generation
 * and converts them to the correct point dimensions for Google Docs.
 *
 * @param scaledWidth - Width in pixels (after DPI scaling)
 * @param scaledHeight - Height in pixels (after DPI scaling)
 * @returns Object with width and height in points for Google Docs
 */
export function calculateLatexImageDimensions(
  scaledWidth: number,
  scaledHeight: number,
): { width: number; height: number } {
  // Only divide out the DPI scaling, not the visual scaling
  const actualWidth = scaledWidth / DPI_SCALE_FACTOR;
  const actualHeight = scaledHeight / DPI_SCALE_FACTOR;

  return {
    width: pxToPt(actualWidth),
    height: pxToPt(actualHeight),
  };
}

/**
 * Calculate Google Docs dimensions for Oak curriculum images.
 * Applies visual scaling and converts pixels to points.
 *
 * @param width - Width in pixels from Oak curriculum
 * @param height - Height in pixels from Oak curriculum
 * @returns Object with width and height in points for Google Docs
 */
export function calculateStemImageDimensions(
  width: number,
  height: number,
): { width: number; height: number } {
  // Apply visual scaling
  const scaledWidth = width * STEM_IMAGE_SCALE;
  const scaledHeight = height * STEM_IMAGE_SCALE;

  return {
    width: pxToPt(scaledWidth),
    height: pxToPt(scaledHeight),
  };
}

/**
 * Shared constants for image processing and dimension calculations
 */

/**
 * Scale factor used for PNG generation and dimension calculations.
 * Current value of 3.0 produces ~288 DPI images (assuming 96 DPI base).
 */
export const IMAGE_SCALE_FACTOR = 3.0;

/**
 * MathJax scaling factor for LaTeX rendering.
 * Controls the base size of LaTeX equations before PNG scaling.
 * 1.0 = normal size, 1.2 = 20% larger, etc.
 */
export const MATHJAX_SCALE = 1.2;

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
 * Get Google Docs dimensions from scaled pixel values.
 * Takes pixel dimensions that were scaled up during PNG generation
 * and converts them to the correct point dimensions for Google Docs.
 *
 * @param scaledWidth - Width in pixels (after scaling)
 * @param scaledHeight - Height in pixels (after scaling)
 * @returns Object with width and height in points for Google Docs
 */
export function getGoogleDocsDimensions(
  scaledWidth: number,
  scaledHeight: number,
): { width: number; height: number } {
  const actualWidth = scaledWidth / IMAGE_SCALE_FACTOR;
  const actualHeight = scaledHeight / IMAGE_SCALE_FACTOR;

  return {
    width: pxToPt(actualWidth),
    height: pxToPt(actualHeight),
  };
}

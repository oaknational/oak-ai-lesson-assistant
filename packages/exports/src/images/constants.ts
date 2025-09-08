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
 * Max dimensions for images in quiz docs (points)
 */
export const QUIZ_IMAGE_MAX_WIDTH = 250;
export const QUIZ_IMAGE_MAX_HEIGHT = 180;

/**
 * Max dimensions for images in other docs (points)
 */
export const DOC_IMAGE_MAX_WIDTH = 100;
export const DOC_IMAGE_MAX_HEIGHT = 60;

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

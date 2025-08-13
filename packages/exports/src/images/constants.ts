/**
 * Shared constants for image processing and dimension calculations
 */

/**
 * Scale factor used for PNG generation and dimension calculations.
 * This value is used to:
 * 1. Scale up SVG->PNG conversion for better quality (3x resolution)
 * 2. Scale down pixel dimensions for correct point values in Google Docs
 */
export const IMAGE_SCALE_FACTOR = 3.0;

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
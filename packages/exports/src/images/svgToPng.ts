import { aiLogger } from "@oakai/logger";

import { renderAsync } from "@resvg/resvg-js";

import { DPI_SCALE_FACTOR } from "./constants";

const log = aiLogger("exports");

/**
 * Convert SVG to high-quality PNG with configurable scaling.
 * 
 * Combines DPI scaling (for resolution) with optional visual scaling (for size).
 * This dual-scaling approach allows LaTeX images to be both high-resolution 
 * and appropriately sized when inserted into Google Docs.
 * 
 * @param svgString - The SVG markup to convert
 * @param additionalScale - Visual scaling multiplier (1.0 = no additional scaling)
 * @returns PNG buffer with dimensions, scaled at (DPI_SCALE_FACTOR × additionalScale)
 */
export async function svgToPng(
  svgString: string, 
  additionalScale = 1.0
): Promise<{
  buffer: Buffer;
  width: number;
  height: number;
}> {
  try {
    // Calculate total scale: base DPI scaling × visual scaling
    // Example: 3.0 (DPI) × 1.5 (visual) = 4.5x final scale
    const scaleFactor = DPI_SCALE_FACTOR * additionalScale;
    
    log.info(`Converting SVG to PNG with scale factor ${scaleFactor}`);
    const resvg = await renderAsync(svgString, {
      fitTo: {
        mode: "zoom",
        value: scaleFactor,
      },
      background: "rgba(255, 255, 255, 0)", // Transparent background
      font: {
        // Disable system fonts for 1000x performance boost (300ms → 0.5ms)
        // Safe because MathJax embeds all required glyphs directly in SVG
        loadSystemFonts: false,
      },
    });

    const pngBuffer = resvg.asPng();
    log.info("PNG generation complete:", `${resvg.width}×${resvg.height}px, ${pngBuffer.length} bytes`);

    return {
      buffer: pngBuffer,
      width: resvg.width,
      height: resvg.height,
    };
  } catch (error) {
    throw new Error("SVG to PNG conversion failed", { cause: error });
  }
}

import { aiLogger } from "@oakai/logger";

import { Resvg } from "@resvg/resvg-js";

const log = aiLogger("exports");

/**
 * Convert an SVG string to PNG buffer
 */
export function svgToPng(
  svgString: string,
  options: {
    width?: number;
    height?: number;
    background?: string;
  } = {},
): Buffer {
  try {
    const resvg = new Resvg(svgString, {
      fitTo: options.width
        ? {
            mode: "width",
            value: options.width,
          }
        : undefined,
      background: options.background ?? "rgba(255, 255, 255, 0)", // Transparent by default
      font: {
        loadSystemFonts: true, // Load system fonts to render text
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    log.info(`Converted SVG to PNG (${pngBuffer.length} bytes)`);
    return pngBuffer;
  } catch (error) {
    log.error("Failed to convert SVG to PNG", error);
    throw new Error(
      `SVG to PNG conversion failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

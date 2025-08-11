import { aiLogger } from "@oakai/logger";

import { Resvg } from "@resvg/resvg-js";

const log = aiLogger("exports");

export function svgToPng(
  svgString: string,
  options: {
    width?: number;
    height?: number;
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
      background: "rgba(255, 255, 255, 0)",
      font: {
        loadSystemFonts: true,
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    log.info(`Converted SVG to PNG (${pngBuffer.length} bytes)`);
    return pngBuffer;
  } catch (error) {
    throw new Error("SVG to PNG conversion failed", { cause: error });
  }
}

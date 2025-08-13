import { renderAsync } from "@resvg/resvg-js";

import { IMAGE_SCALE_FACTOR } from "./constants";

export async function svgToPng(svgString: string): Promise<{
  buffer: Buffer;
  width: number;
  height: number;
}> {
  try {
    const resvg = await renderAsync(svgString, {
      fitTo: {
        mode: "zoom",
        value: IMAGE_SCALE_FACTOR,
      },
      background: "rgba(255, 255, 255, 0)",
      font: {
        loadSystemFonts: false, // MathJax embeds all glyphs, no system fonts needed
      },
    });

    const pngBuffer = resvg.asPng();

    return {
      buffer: pngBuffer,
      width: resvg.width,
      height: resvg.height,
    };
  } catch (error) {
    throw new Error("SVG to PNG conversion failed", { cause: error });
  }
}

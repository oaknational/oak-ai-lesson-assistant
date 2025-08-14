import { aiLogger } from "@oakai/logger";

import { Resvg } from "@resvg/resvg-js";

const log = aiLogger("exports");

export function svgToPng(svgString: string): {
  buffer: Buffer;
  width: number;
  height: number;
} {
  try {
    log.info(`Converting SVG to PNG`);
    const resvg = new Resvg(svgString, {
      fitTo: {
        mode: "zoom",
        value: 3,
      },
      background: "rgba(255, 255, 255, 0)",
      font: {
        loadSystemFonts: true,
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    log.info("Original SVG Size:", `${resvg.width} x ${resvg.height}`);
    log.info("Output PNG Size  :", `${pngData.width} x ${pngData.height}`);

    log.info(`Converted SVG to PNG (${pngBuffer.length} bytes)`);
    return {
      buffer: pngBuffer,
      width: pngData.width,
      height: pngData.height,
    };
  } catch (error) {
    throw new Error("SVG to PNG conversion failed", { cause: error });
  }
}

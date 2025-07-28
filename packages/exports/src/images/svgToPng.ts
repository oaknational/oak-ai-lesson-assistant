import { aiLogger } from "@oakai/logger";

const log = aiLogger("exports");

/**
 * Convert an SVG string to PNG buffer
 */
export async function svgToPng(
  svgString: string,
  options: {
    width?: number;
    height?: number;
    background?: string;
  } = {},
): Promise<Buffer> {
  try {
    // Dynamic import to avoid bundling issues
    const { Resvg } = await import("@resvg/resvg-js");

    const resvg = new Resvg(svgString, {
      fitTo: options.width
        ? {
            mode: "width",
            value: options.width,
          }
        : undefined,
      background: options.background || "rgba(255, 255, 255, 0)", // Transparent by default
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

/**
 * Create a test SVG that looks like a mathematical equation
 * This simulates what we'd get from MathJax
 */
export function createTestEquationSvg(): string {
  // SVG for the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a
  return `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="60" viewBox="0 0 280 60">
    <defs>
      <style>
        .math { font-family: 'Times New Roman', serif; font-size: 18px; }
        .math-italic { font-style: italic; }
        .math-symbol { font-size: 20px; }
      </style>
    </defs>
    <g transform="translate(10, 35)">
      <!-- x = -->
      <text x="0" y="0" class="math math-italic">x</text>
      <text x="15" y="0" class="math">=</text>
      
      <!-- Fraction bar -->
      <line x1="35" y1="-2" x2="255" y2="-2" stroke="black" stroke-width="1"/>
      
      <!-- Numerator: -b ± √(b² - 4ac) -->
      <g transform="translate(35, -12)">
        <text x="0" y="0" class="math">−</text>
        <text x="15" y="0" class="math math-italic">b</text>
        <text x="30" y="0" class="math">±</text>
        <text x="50" y="0" class="math-symbol">√</text>
        <line x1="65" y1="-12" x2="150" y2="-12" stroke="black" stroke-width="1"/>
        <g transform="translate(70, -2)">
          <text x="0" y="0" class="math math-italic">b</text>
          <text x="12" y="-5" class="math" font-size="14">2</text>
          <text x="25" y="0" class="math">−</text>
          <text x="40" y="0" class="math">4</text>
          <text x="50" y="0" class="math math-italic">ac</text>
        </g>
      </g>
      
      <!-- Denominator: 2a -->
      <g transform="translate(130, 15)">
        <text x="0" y="0" class="math">2</text>
        <text x="10" y="0" class="math math-italic">a</text>
      </g>
    </g>
  </svg>`;
}

/**
 * Create a simple inline equation SVG
 */
export function createTestInlineEquationSvg(): string {
  // SVG for E = mc²
  return `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="25" viewBox="0 0 80 25">
    <defs>
      <style>
        .math { font-family: 'Times New Roman', serif; font-size: 16px; }
        .math-italic { font-style: italic; }
        .superscript { font-size: 12px; }
      </style>
    </defs>
    <g transform="translate(5, 18)">
      <text x="0" y="0" class="math math-italic">E</text>
      <text x="15" y="0" class="math">=</text>
      <text x="30" y="0" class="math math-italic">mc</text>
      <text x="50" y="-5" class="math superscript">2</text>
    </g>
  </svg>`;
}

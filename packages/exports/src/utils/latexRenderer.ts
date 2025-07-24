import { aiLogger } from "@oakai/logger";

import type { LatexPattern } from "../gSuite/docs/findLatexPatterns";
import { generateLatexHash } from "../gSuite/docs/findLatexPatterns";

const log = aiLogger("exports");

// Cache for MathJax instance
let MathJax: any = null;

// Cache for rendered equations to avoid duplicate processing
const renderCache = new Map<string, Buffer>();

/**
 * Initialize MathJax if not already initialized
 */
async function initMathJax() {
  if (!MathJax) {
    log.info("Initializing MathJax for server-side rendering");
    
    try {
      // Initialize MathJax following the official Node.js demo pattern
      MathJax = await require('mathjax-full').init({
        loader: {
          load: ['adaptors/liteDOM', 'tex-svg']
        },
        tex: {
          packages: ['base', 'ams', 'newcommand', 'require', 'autoload'],
          inlineMath: [
            ["$", "$"],
            ["\\(", "\\)"],
          ],
          displayMath: [
            ["$$", "$$"],
            ["\\[", "\\]"],
          ],
        },
        svg: {
          fontCache: 'local',
          scale: 1.2,
        },
        startup: {
          typeset: false  // We'll convert manually
        }
      });
      
      log.info("MathJax initialized successfully");
    } catch (error) {
      log.error("Failed to initialize MathJax", error);
      throw error;
    }
  }
  return MathJax;
}

/**
 * Render a single LaTeX expression to PNG
 */
export async function renderLatexToPng(
  latex: string,
  type: "inline" | "display",
): Promise<Buffer> {
  // Check cache first
  const cacheKey = `${type}:${generateLatexHash(latex)}`;
  const cached = renderCache.get(cacheKey);
  if (cached) {
    log.info(`Using cached render for LaTeX: ${latex.substring(0, 30)}...`);
    return cached;
  }

  try {
    // Initialize MathJax
    await initMathJax();

    // Convert LaTeX to SVG using tex2svgPromise
    const svg = await MathJax.tex2svgPromise(latex, {
      display: type === "display",
      em: 16,
      ex: 8,
      containerWidth: type === "display" ? 80 * 16 : 40 * 16
    });

    // Extract the SVG element
    const adaptor = MathJax.startup.adaptor;
    const svgString = adaptor.innerHTML(svg) as string;

    // Clean up SVG for better rendering
    // Remove MathJax-specific attributes that might cause issues
    const cleanedSvg = svgString
      .replace(/data-mml-node="[^"]*"/g, "")
      .replace(/data-c="[^"]*"/g, "");

    // Convert SVG to PNG using resvg-js (dynamic import to avoid bundling issues)
    const { Resvg } = await import("@resvg/resvg-js");
    const resvg = new Resvg(cleanedSvg, {
      fitTo: {
        mode: "width",
        value: type === "display" ? 600 : 300, // Larger for display equations
      },
      background: "rgba(255, 255, 255, 0)", // Transparent background
      font: {
        loadSystemFonts: false, // Use embedded fonts from MathJax
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // Cache the result
    renderCache.set(cacheKey, pngBuffer);

    log.info(`Rendered LaTeX to PNG: ${latex.substring(0, 30)}...`);
    return pngBuffer;
  } catch (error) {
    log.error(`Failed to render LaTeX: ${latex}`, error);
    throw new Error(
      `LaTeX rendering failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Render multiple LaTeX patterns in batch
 */
export async function batchRenderLatex(
  patterns: LatexPattern[],
): Promise<Map<string, Buffer>> {
  const results = new Map<string, Buffer>();

  // Process in parallel for better performance
  const renderPromises = patterns.map(async (pattern) => {
    try {
      const buffer = await renderLatexToPng(pattern.latex, pattern.type);
      const hash = generateLatexHash(pattern.latex);
      results.set(hash, buffer);
    } catch (error) {
      log.error(
        `Failed to render pattern at index ${pattern.startIndex}`,
        error,
      );
      // Don't throw - allow other renders to complete
    }
  });

  await Promise.all(renderPromises);

  log.info(
    `Batch rendered ${results.size}/${patterns.length} LaTeX expressions`,
  );
  return results;
}

/**
 * Clear the render cache (useful for testing or memory management)
 */
export function clearRenderCache(): void {
  renderCache.clear();
  log.info("Cleared LaTeX render cache");
}

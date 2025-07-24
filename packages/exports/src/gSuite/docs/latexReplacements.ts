import { aiLogger } from "@oakai/logger";

import type { docs_v1 } from "@googleapis/docs";

import type { LatexPattern } from "./findLatexPatterns";
import { generateLatexHash } from "./findLatexPatterns";

const log = aiLogger("exports");

export interface LatexImage {
  hash: string;
  url: string;
  latex: string;
  type: "inline" | "display";
}

/**
 * Generate Google Docs API requests to replace LaTeX patterns with images
 */
export function latexReplacements(
  patterns: LatexPattern[],
  imageUrls: Map<string, string>,
): { requests: docs_v1.Schema$Request[] } {
  if (patterns.length === 0) {
    log.info("No LaTeX patterns to process.");
    return { requests: [] };
  }

  let cumulativeShift = 0; // Tracks the total index shift from previous operations
  const requests: docs_v1.Schema$Request[] = [];

  patterns.forEach((pattern) => {
    const hash = generateLatexHash(pattern.latex);
    const imageUrl = imageUrls.get(hash);

    if (!imageUrl) {
      log.warn(
        `No image URL found for LaTeX: ${pattern.latex.substring(0, 30)}...`,
      );
      return; // Skip this pattern
    }

    // Adjust the start and end index dynamically based on the cumulative shift
    const adjustedStartIndex = pattern.startIndex + cumulativeShift;
    const adjustedEndIndex = adjustedStartIndex + pattern.fullMatch.length;

    // Request to delete the LaTeX pattern text
    requests.push({
      deleteContentRange: {
        range: {
          startIndex: adjustedStartIndex,
          endIndex: adjustedEndIndex,
        },
      },
    });

    // Determine image size based on equation type
    const imageSize =
      pattern.type === "display"
        ? { width: 300, height: 100 } // Larger for display equations
        : { width: 150, height: 50 }; // Smaller for inline equations

    // Request to insert the inline image at the adjusted startIndex
    requests.push({
      insertInlineImage: {
        uri: imageUrl,
        location: {
          index: adjustedStartIndex, // Insert at the same startIndex where LaTeX was removed
        },
        objectSize: {
          height: {
            magnitude: imageSize.height,
            unit: "PT",
          },
          width: {
            magnitude: imageSize.width,
            unit: "PT",
          },
        },
      },
    });

    // Calculate the shift: inline image adds 1, LaTeX pattern removes its length
    const netShift = 1 - pattern.fullMatch.length;
    cumulativeShift += netShift;
  });

  log.info(
    `Generated ${requests.length} requests for ${patterns.length} LaTeX patterns`,
  );
  return { requests };
}

/**
 * Process LaTeX patterns end-to-end: render and generate replacement requests
 * This is a convenience function that combines rendering and replacement generation
 */
export async function processLatexPatterns(
  patterns: LatexPattern[],
  renderFn: (pattern: LatexPattern) => Promise<string>,
): Promise<{ requests: docs_v1.Schema$Request[] }> {
  const imageUrls = new Map<string, string>();

  // Render all patterns and collect URLs
  const renderPromises = patterns.map(async (pattern) => {
    try {
      const url = await renderFn(pattern);
      const hash = generateLatexHash(pattern.latex);
      imageUrls.set(hash, url);
    } catch (error) {
      log.error(
        `Failed to process LaTeX pattern: ${pattern.latex.substring(0, 30)}...`,
        error,
      );
    }
  });

  await Promise.all(renderPromises);

  // Generate replacement requests
  return latexReplacements(patterns, imageUrls);
}

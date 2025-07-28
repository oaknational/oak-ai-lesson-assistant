import { aiLogger } from "@oakai/logger";

import type { docs_v1 } from "@googleapis/docs";

import {
  createTestEquationSvg,
  createTestInlineEquationSvg,
  svgToPng,
} from "../../images/svgToPng";
import { type LatexPattern, findLatexPatterns } from "./findLatexPatterns";

const log = aiLogger("exports");

/**
 * Uploads an image buffer to a cloud service and returns the URL
 * TODO: Implement actual upload to Cloudinary, S3, or GCS
 */
async function uploadImage(buffer: Buffer, filename: string): Promise<string> {
  log.info(`TODO: Upload image ${filename} (${buffer.length} bytes)`);
  // For now, return a placeholder URL
  return `https://placeholder.com/latex/${filename}`;
}

/**
 * Convert LaTeX patterns to markdown image syntax
 * This allows the existing imageReplacements system to handle the actual image insertion
 */
export async function latexToImageReplacements(
  documentText: string,
): Promise<{ modifiedText: string; imageUrls: string[] }> {
  const patterns = findLatexPatterns(documentText);

  if (patterns.length === 0) {
    log.info("No LaTeX patterns found");
    return { modifiedText: documentText, imageUrls: [] };
  }

  log.info(`Found ${patterns.length} LaTeX patterns to convert`);

  let modifiedText = documentText;
  const imageUrls: string[] = [];
  let offset = 0; // Track how much we've shifted the indices

  // Process patterns in order to maintain correct indices
  for (const pattern of patterns) {
    try {
      // For now, use test SVGs instead of actual MathJax rendering
      // TODO: Replace with actual MathJax SVG generation
      const svg =
        pattern.type === "display"
          ? createTestEquationSvg()
          : createTestInlineEquationSvg();

      // Convert SVG to PNG
      const pngBuffer = await svgToPng(svg, {
        width: pattern.type === "display" ? 600 : 200,
        background: "white", // White background for better visibility in docs
      });

      // Upload the image
      const filename = `latex-${pattern.hash}.png`;
      const imageUrl = await uploadImage(pngBuffer, filename);
      imageUrls.push(imageUrl);

      // Create markdown image syntax
      const altText =
        pattern.latex.substring(0, 50) +
        (pattern.latex.length > 50 ? "..." : "");
      const markdownImage = `![${altText}](${imageUrl})`;

      // Replace the LaTeX pattern with markdown image
      const adjustedStart = pattern.startIndex + offset;
      const adjustedEnd = pattern.endIndex + offset;

      modifiedText =
        modifiedText.substring(0, adjustedStart) +
        markdownImage +
        modifiedText.substring(adjustedEnd);

      // Update offset for next replacements
      offset += markdownImage.length - (pattern.endIndex - pattern.startIndex);

      log.info(`Replaced LaTeX pattern: ${pattern.latex.substring(0, 30)}...`);
    } catch (error) {
      log.error(`Failed to process LaTeX pattern: ${pattern.latex}`, error);
      // Continue processing other patterns
    }
  }

  return { modifiedText, imageUrls };
}

/**
 * Create requests to replace LaTeX patterns with images in a Google Doc
 * This is an alternative approach that creates direct replacement requests
 */
export async function createLatexImageRequests(
  patterns: LatexPattern[],
): Promise<docs_v1.Schema$Request[]> {
  const requests: docs_v1.Schema$Request[] = [];
  let cumulativeShift = 0;

  for (const pattern of patterns) {
    try {
      // For now, use test SVGs
      const svg =
        pattern.type === "display"
          ? createTestEquationSvg()
          : createTestInlineEquationSvg();

      // Convert to PNG
      const pngBuffer = await svgToPng(svg, {
        width: pattern.type === "display" ? 600 : 200,
        background: "white",
      });

      // Upload image
      const filename = `latex-${pattern.hash}.png`;
      const imageUrl = await uploadImage(pngBuffer, filename);

      // Adjust indices based on previous modifications
      const adjustedStart = pattern.startIndex + cumulativeShift;
      const adjustedEnd = pattern.endIndex + cumulativeShift;

      // Delete the LaTeX text
      requests.push({
        deleteContentRange: {
          range: {
            startIndex: adjustedStart,
            endIndex: adjustedEnd,
          },
        },
      });

      // Insert the image
      requests.push({
        insertInlineImage: {
          uri: imageUrl,
          location: {
            index: adjustedStart,
          },
          objectSize: {
            height: {
              magnitude: pattern.type === "display" ? 100 : 30,
              unit: "PT",
            },
            width: {
              magnitude: pattern.type === "display" ? 300 : 100,
              unit: "PT",
            },
          },
        },
      });

      // Update cumulative shift (1 character for image - length of LaTeX)
      const netShift = 1 - (pattern.endIndex - pattern.startIndex);
      cumulativeShift += netShift;
    } catch (error) {
      log.error(
        `Failed to create request for LaTeX pattern: ${pattern.latex}`,
        error,
      );
    }
  }

  return requests;
}

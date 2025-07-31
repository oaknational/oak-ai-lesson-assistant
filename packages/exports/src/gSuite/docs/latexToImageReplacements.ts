import { aiLogger } from "@oakai/logger";

import {
  generateLatexImageFilename,
  getExistingImageUrl,
  uploadImageToGCS,
} from "../../images/gcsUploader";
import { latexToSvg } from "../../images/latexToSvg";
import { svgToPng } from "../../images/svgToPng";
import { findLatexPatterns } from "./findLatexPatterns";

const log = aiLogger("exports");

function generateAltText(latex: string): string {
  const trimmed = latex.substring(0, 50) + (latex.length > 50 ? "..." : "");
  return `LaTeX pattern ${trimmed}`;
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

  // First pass: Prepare all images for upload
  const imagePromises = patterns.map(async (pattern) => {
    // Check if image already exists
    const existingUrl = await getExistingImageUrl(pattern.hash);
    if (existingUrl) {
      log.info(
        `Using existing LaTeX image: ${pattern.latex.substring(0, 30)}...`,
      );
      return existingUrl;
    }

    // Generate and upload new image
    const svg = latexToSvg(pattern.latex, pattern.type === "display");
    const pngResult = svgToPng(svg);
    const url = await uploadImageToGCS(
      pngResult.buffer,
      pattern.hash,
      pngResult.width,
      pngResult.height,
    );
    log.info(`Uploaded new LaTeX image: ${pattern.latex.substring(0, 30)}...`);
    return url;
  });

  // Upload all images in parallel
  const imageUrls = await Promise.all(imagePromises);

  // Second pass: Replace LaTeX patterns with markdown images
  let modifiedText = documentText;
  let offset = 0;

  patterns.forEach((pattern, index) => {
    const imageUrl = imageUrls[index];
    const altText = generateAltText(pattern.latex);
    const markdownImage = `![${altText}](${imageUrl})`;

    const adjustedStart = pattern.startIndex + offset;
    const adjustedEnd = pattern.endIndex + offset;

    modifiedText =
      modifiedText.substring(0, adjustedStart) +
      markdownImage +
      modifiedText.substring(adjustedEnd);

    offset += markdownImage.length - (pattern.endIndex - pattern.startIndex);
  });

  return { modifiedText, imageUrls };
}

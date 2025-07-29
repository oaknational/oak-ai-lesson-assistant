import { aiLogger } from "@oakai/logger";

import { latexToSvg } from "../../images/latexToSvg";
import { svgToPng } from "../../images/svgToPng";
import { findLatexPatterns } from "./findLatexPatterns";

const log = aiLogger("exports");

function getImageUrl(hash: string): string {
  return `https://placeholder.com/latex/latex-${hash}.png}`;
}

/**
 * Uploads an image buffer to a cloud service
 * TODO: Implement actual upload to GCS
 */
async function uploadImage(buffer: Buffer, latexHash: string): Promise<string> {
  log.info(`SIMULATED: Uploading image ${latexHash} (${buffer.length} bytes)`);
  // Simulate async upload
  await new Promise((resolve) => setTimeout(resolve, 100));
  return getImageUrl(latexHash);
}

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

  // First pass: Replace all LaTeX patterns with markdown images
  let modifiedText = documentText;
  const imagesToUpload: Array<{ buffer: Buffer; latexHash: string }> = [];
  let offset = 0;

  for (const pattern of patterns) {
    const imageUrl = getImageUrl(pattern.hash);
    const altText = generateAltText(pattern.latex);
    const markdownImage = `![${altText}](${imageUrl})`;

    const adjustedStart = pattern.startIndex + offset;
    const adjustedEnd = pattern.endIndex + offset;

    modifiedText =
      modifiedText.substring(0, adjustedStart) +
      markdownImage +
      modifiedText.substring(adjustedEnd);

    offset += markdownImage.length - (pattern.endIndex - pattern.startIndex);

    const svg = latexToSvg(pattern.latex, pattern.type === "display");

    const pngBuffer = svgToPng(svg);

    imagesToUpload.push({ buffer: pngBuffer, latexHash: pattern.hash });

    log.info(`Prepared LaTeX pattern: ${pattern.latex.substring(0, 30)}...`);
  }

  // Second pass: Upload all images in parallel
  const imageUrls = await Promise.all(
    imagesToUpload.map(({ buffer, latexHash }) =>
      uploadImage(buffer, latexHash),
    ),
  );

  return { modifiedText, imageUrls };
}

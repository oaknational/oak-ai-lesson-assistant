import { aiLogger } from "@oakai/logger";

import type { docs_v1 } from "@googleapis/docs";

import {
  getExistingImageUrl,
  uploadImageToGCS,
} from "../../../images/gcsUploader";
import { latexToSvg } from "../../../images/latexToSvg";
import { svgToPng } from "../../../images/svgToPng";
import { extractTextFromDocument } from "../extraction/extractTextFromDocument";
import { generateLatexHash } from "../extraction/findLatexPatterns";

const log = aiLogger("exports");

/**
 * Replace LaTeX patterns in a Google Doc with markdown image syntax
 * This prepares LaTeX for the existing markdown image replacement pipeline
 *
 * @param googleDocs - Google Docs API client
 * @param documentId - ID of the document to process
 * @returns Promise that resolves when replacements are complete
 */
export async function replaceLatexInDocument(
  googleDocs: docs_v1.Docs,
  documentId: string,
): Promise<void> {
  // 1. Get the document content
  const doc = await googleDocs.documents.get({ documentId });
  if (!doc.data.body?.content) {
    return;
  }

  // 2. Extract text and find unique LaTeX patterns
  const textContent = extractTextFromDocument(doc.data.body.content);
  const latexPatterns = findUniqueLatexPatterns(textContent);

  if (latexPatterns.length === 0) {
    log.info("No LaTeX patterns found in document");
    return;
  }

  log.info(`Found ${latexPatterns.length} unique LaTeX patterns to convert`);

  // 3. Generate images for all unique patterns in parallel
  const imageUrls = await generateLatexImages(latexPatterns);

  // 4. Create replacement requests for each unique pattern
  const requests: docs_v1.Schema$Request[] = [];

  for (const pattern of latexPatterns) {
    const imageUrl = imageUrls.get(pattern);
    if (!imageUrl) continue;

    const altText = `LaTeX: ${pattern.substring(0, 50)}${pattern.length > 50 ? "..." : ""}`;
    const markdownImage = `![${altText}](${imageUrl})`;

    // Replace ALL occurrences of this LaTeX pattern in the document
    requests.push({
      replaceAllText: {
        containsText: {
          text: `$$${pattern}$$`,
          matchCase: true,
        },
        replaceText: markdownImage,
      },
    });
  }

  // 5. Execute all replacements
  if (requests.length > 0) {
    await googleDocs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests,
      },
    });
    log.info(
      `Replaced ${requests.length} unique LaTeX patterns with markdown images`,
    );
  }
}

/**
 * Find unique LaTeX patterns in the document text
 */
function findUniqueLatexPatterns(text: string): string[] {
  const patterns = new Set<string>();
  const regex = /\$\$([^$]+)\$\$/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      patterns.add(match[1].trim());
    }
  }

  return Array.from(patterns);
}

/**
 * Generate and upload images for LaTeX patterns
 */
async function generateLatexImages(
  patterns: string[],
): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();

  // Process all patterns in parallel
  const imagePromises = patterns.map(async (pattern) => {
    const hash = generateLatexHash(pattern);

    // Check if image already exists
    const existingUrl = await getExistingImageUrl(hash);
    if (existingUrl) {
      log.info(`Using existing LaTeX image: ${pattern.substring(0, 30)}...`);
      return { pattern, url: existingUrl };
    }

    // Generate and upload new image
    const svg = latexToSvg(pattern, false); // inline mode
    const pngResult = svgToPng(svg);
    const url = await uploadImageToGCS(
      pngResult.buffer,
      hash,
      pngResult.width,
      pngResult.height,
    );
    log.info(`Uploaded new LaTeX image: ${pattern.substring(0, 30)}...`);
    return { pattern, url };
  });

  const results = await Promise.all(imagePromises);

  // Build map
  for (const { pattern, url } of results) {
    imageMap.set(pattern, url);
  }

  return imageMap;
}

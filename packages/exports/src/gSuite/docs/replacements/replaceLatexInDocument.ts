import { aiLogger } from "@oakai/logger";

import type { docs_v1 } from "@googleapis/docs";
import { createHash } from "crypto";

import {
  getExistingImageUrl,
  uploadImageToGCS,
} from "../../../images/gcsUploader";
import { latexToSvg } from "../../../images/latexToSvg";
import { svgToPng } from "../../../images/svgToPng";
import { extractTextFromDocument } from "../extraction/extractTextFromDocument";

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
 * Generate a hash for a LaTeX expression to use as a unique identifier
 */
function generateLatexHash(latex: string): string {
  return createHash("md5").update(latex).digest("hex").substring(0, 12);
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

  log.info(
    `Starting LaTeX image processing for ${patterns.length} unique patterns`,
  );

  // Check existence for all patterns in parallel
  log.info("Starting parallel existence checks");
  const patternData = await Promise.all(
    patterns.map(async (pattern) => {
      const hash = generateLatexHash(pattern);
      const existingUrl = await getExistingImageUrl(hash);

      return {
        pattern,
        hash,
        exists: existingUrl !== null,
        url: existingUrl,
      };
    }),
  );

  // Partition results once
  const existing = patternData.filter((p) => p.exists);
  const missing = patternData.filter((p) => !p.exists);

  log.info(
    `Existence checks complete: ${existing.length} cached, ${missing.length} need generation`,
  );

  // Add existing images to map
  for (const item of existing) {
    if (item.url) {
      imageMap.set(item.pattern, item.url);
    }
  }

  // Generate and upload missing PNGs in parallel
  if (missing.length > 0) {
    log.info(`Starting parallel PNG generation for ${missing.length} patterns`);

    const pngPromises = missing.map(async (item) => {
      const svg = latexToSvg(item.pattern, false);
      const pngResult = await svgToPng(svg);
      const url = await uploadImageToGCS(
        pngResult.buffer,
        item.hash,
        pngResult.width,
        pngResult.height,
      );

      return { pattern: item.pattern, url };
    });

    const results = await Promise.all(pngPromises);

    for (const { pattern, url } of results) {
      imageMap.set(pattern, url);
    }

    log.info("PNG generation complete");
  }

  log.info("LaTeX image processing complete");
  return imageMap;
}

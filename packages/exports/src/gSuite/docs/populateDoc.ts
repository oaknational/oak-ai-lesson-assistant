import { aiLogger } from "@oakai/logger";

import type { docs_v1 } from "@googleapis/docs";

import type { Result } from "../../types";
import type { ValueToString } from "../../utils";
import { defaultValueToString } from "../../utils";
import { batchUploadImages } from "../../utils/imageUploader";
import { batchRenderLatex } from "../../utils/latexRenderer";
import { cleanupUnusedPlaceholdersRequests } from "./cleanupUnusedPlaceholdersRequests";
import { findLatexInDocument } from "./findLatexInDocument";
import { generateLatexHash } from "./findLatexPatterns";
import { findMarkdownImages } from "./findMarkdownImages";
import { imageReplacements } from "./imageReplacements";
import { processLatexPatterns } from "./latexReplacements";
import { textReplacements } from "./textReplacements";

const log = aiLogger("exports");

/**
 * Populates the template document with the given data, handling image replacements for all placeholders.
 */
export async function populateDoc<
  Data extends Record<string, string | string[] | null | undefined>,
>({
  googleDocs,
  documentId,
  data,
  warnIfMissing = [],
  valueToString = defaultValueToString,
  enablePlaceholderCleanup = false,
  enableLatexRendering = false,
}: {
  googleDocs: docs_v1.Docs;
  documentId: string;
  data: Data;
  warnIfMissing?: (keyof Data)[];
  valueToString?: ValueToString<Data>;
  enablePlaceholderCleanup?: boolean;
  enableLatexRendering?: boolean;
}): Promise<Result<{ missingData: string[] }>> {
  try {
    const missingData: string[] = [];

    const { requests: textRequests } = textReplacements({
      data,
      warnIfMissing,
      valueToString,
    });

    if (textRequests.length > 0) {
      await googleDocs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: textRequests,
        },
      });
    }

    // Process LaTeX equations if enabled
    if (enableLatexRendering) {
      log.info("Processing LaTeX equations in document");

      const latexPatterns = await findLatexInDocument(googleDocs, documentId);

      if (latexPatterns.length > 0) {
        // Render LaTeX patterns to PNG
        const renderedImages = await batchRenderLatex(latexPatterns);

        // Upload images and get public URLs
        const imagesToUpload = Array.from(renderedImages.entries()).map(
          ([hash, buffer]) => {
            const pattern = latexPatterns.find(
              (p) => generateLatexHash(p.latex) === hash,
            );
            return {
              buffer,
              latex: pattern?.latex ?? "",
              type: pattern?.type ?? ("inline" as const),
            };
          },
        );

        const uploadedUrls = await batchUploadImages(imagesToUpload);

        // Generate replacement requests
        const { requests: latexRequests } = await processLatexPatterns(
          latexPatterns,
          (pattern) => {
            const hash = generateLatexHash(pattern.latex);
            const url = uploadedUrls.get(hash);
            if (!url) {
              throw new Error(`No URL found for LaTeX: ${pattern.latex}`);
            }
            return Promise.resolve(url);
          },
        );

        if (latexRequests.length > 0) {
          await googleDocs.documents.batchUpdate({
            documentId,
            requestBody: {
              requests: latexRequests,
            },
          });
        }
      }
    }

    const markdownImages = await findMarkdownImages(googleDocs, documentId);

    const { requests: imageRequests } = imageReplacements(markdownImages);

    if (imageRequests.length > 0) {
      await googleDocs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: imageRequests,
        },
      });
    }

    if (enablePlaceholderCleanup) {
      const cleanupRequests = await cleanupUnusedPlaceholdersRequests(
        googleDocs,
        documentId,
      );

      if (cleanupRequests.length > 0) {
        await googleDocs.documents.batchUpdate({
          documentId,
          requestBody: {
            requests: cleanupRequests,
          },
        });
      }
    }

    return {
      data: {
        missingData,
      },
    };
  } catch (error) {
    log.error("Failed to populate document:", error);
    return {
      error,
      message: "Failed to populate doc template",
    };
  }
}

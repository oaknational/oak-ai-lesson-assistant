import { aiLogger } from "@oakai/logger";

import type { docs_v1 } from "@googleapis/docs";

import {
  DOC_IMAGE_MAX_HEIGHT,
  DOC_IMAGE_MAX_WIDTH,
} from "../../../images/constants";
import type { Result } from "../../../types";
import type { ValueToString } from "../../../utils";
import { defaultValueToString } from "../../../utils";
import { findMarkdownImages } from "../replacements/findMarkdownImages";
import { imageReplacements } from "../replacements/imageReplacements";
import { replaceLatexInDocument } from "../replacements/replaceLatexInDocument";
import { textReplacements } from "../replacements/textReplacements";
import { cleanupUnusedPlaceholdersRequests } from "./cleanupUnusedPlaceholdersRequests";
import { removeTablesWithPlaceholders } from "./removeTablesWithPlaceholders";

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
  tablePlaceholdersToRemove,
  latexVisualScale,
}: {
  googleDocs: docs_v1.Docs;
  documentId: string;
  data: Data;
  warnIfMissing?: (keyof Data)[];
  valueToString?: ValueToString<Data>;
  enablePlaceholderCleanup?: boolean;
  tablePlaceholdersToRemove?: string[];
  latexVisualScale: number;
}): Promise<Result<{ missingData: string[] }>> {
  try {
    const missingData: string[] = [];

    // Remove tables for cycles which aren't used, if applicable
    if (tablePlaceholdersToRemove && tablePlaceholdersToRemove.length > 0) {
      const tableRemovalRequests = await removeTablesWithPlaceholders(
        googleDocs,
        documentId,
        tablePlaceholdersToRemove,
      );

      if (tableRemovalRequests.length > 0) {
        await googleDocs.documents.batchUpdate({
          documentId,
          requestBody: {
            requests: tableRemovalRequests,
          },
        });
      }
    }

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

    // Convert LaTeX patterns to markdown images
    await replaceLatexInDocument(googleDocs, documentId, latexVisualScale);

    const markdownImages = await findMarkdownImages(googleDocs, documentId);

    const { requests: imageRequests } = imageReplacements(markdownImages, {
      maxWidth: DOC_IMAGE_MAX_WIDTH,
      maxHeight: DOC_IMAGE_MAX_HEIGHT,
    });

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

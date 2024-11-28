import type { docs_v1 } from "@googleapis/docs";
import { aiLogger } from "@oakai/logger";

import type { Result } from "../../types";
import type { ValueToString } from "../../utils";
import { defaultValueToString } from "../../utils";
<<<<<<< Updated upstream
=======
import { findMarkdownImages } from "./findMarkdownImages";
import { imageReplacements } from "./imageReplacements";
>>>>>>> Stashed changes
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
}: {
  googleDocs: docs_v1.Docs;
  documentId: string;
  data: Data;
  warnIfMissing?: (keyof Data)[];
  valueToString?: ValueToString<Data>;
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

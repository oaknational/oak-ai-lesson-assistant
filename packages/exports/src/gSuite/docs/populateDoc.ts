import type { docs_v1 } from "@googleapis/docs";

import type { Result } from "../../types";
import type { ValueToString } from "../../utils";
import { defaultValueToString } from "../../utils";
import { processImageReplacements } from "./processImagesReplacements";
import { textReplacements } from "./textReplacements";

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

    // Commenting out this part until the issues are resolved (see @TODOs on function defintiion)
    // await processImageReplacements({
    //   googleDocs,
    //   documentId,
    //   data,
    // });

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

    return {
      data: {
        missingData,
      },
    };
  } catch (error) {
    console.error("Failed to populate document:", error);
    return {
      error,
      message: "Failed to populate doc template",
    };
  }
}

import type { docs_v1 } from "@googleapis/docs";

import type { Result } from "../../types";
import type { ValueToString } from "../../utils";
import { defaultValueToString } from "../../utils";
import { processImageReplacements } from "./processImageReplacements";
import { processTextReplacements } from "./processTextReplacements";

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
    const requests: docs_v1.Schema$Request[] = [];
    const missingData: string[] = [];

    await processImageReplacements({ googleDocs, documentId, data });

    await processTextReplacements({
      googleDocs,
      documentId,
      data,
      missingData,
      warnIfMissing,
      valueToString,
    });

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

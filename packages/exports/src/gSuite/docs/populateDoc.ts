import type { docs_v1 } from "@googleapis/docs";

import type { Result } from "../../types";
import type { ValueToString} from "../../utils";
import { defaultValueToString } from "../../utils";

/**
 * @description Populates the template document with the given data.
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

    Object.entries(data).forEach(([key, value]) => {
      const valueStr = valueToString(key, value);
      if (!valueStr.trim() && warnIfMissing.includes(key)) {
        missingData.push(key);
      }
      requests.push({
        replaceAllText: {
          replaceText: valueStr,
          containsText: {
            text: `{{${key}}}`,
            matchCase: false,
          },
        },
      });
    });

    await googleDocs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests,
      },
    });
    return {
      data: {
        missingData,
      },
    };
  } catch (error) {
    return {
      error,
      message: "Failed to populate doc template",
    };
  }
}

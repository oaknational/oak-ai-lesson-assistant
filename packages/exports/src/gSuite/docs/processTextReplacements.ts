import type { docs_v1 } from "@googleapis/docs";

import type { ValueToString } from "../../utils";

export async function processTextReplacements<
  Data extends Record<string, string | string[] | null | undefined>,
>({
  googleDocs,
  documentId,
  data,
  missingData,
  warnIfMissing,
  valueToString,
}: {
  googleDocs: docs_v1.Docs;
  documentId: string;
  data: Data;
  missingData: string[];
  warnIfMissing: (keyof Data)[];
  valueToString: ValueToString<Data>;
}) {
  for (const [key, value] of Object.entries(data)) {
    const valueStr = valueToString(key, value);

    // check if the value is empty and mark as missing if needed
    if (!valueStr.trim() && warnIfMissing.includes(key)) {
      missingData.push(key);
    }

    // text replacement logic
    if (typeof value !== "string" || !value.includes("![image](")) {
      await googleDocs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: [
            {
              replaceAllText: {
                replaceText: valueStr,
                containsText: {
                  text: `{{${key}}}`,
                  matchCase: false,
                },
              },
            },
          ],
        },
      });
    }
  }
}

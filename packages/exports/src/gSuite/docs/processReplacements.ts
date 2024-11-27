import type { docs_v1 } from "@googleapis/docs";

import type { ValueToString } from "../../utils";

export async function processReplacements<
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
  const requests: docs_v1.Schema$Request[] = [];

  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{{${key}}}`;
    const valueStr = valueToString(key, value);

    // Check for missing data
    if (!valueStr.trim() && warnIfMissing.includes(key)) {
      missingData.push(key);
    }

    // Handle image replacement
    if (typeof value === "string" && value.includes("![image](")) {
      const imageMatch = value.match(/!\[.*?\]\((.*?)\)/);
      const imageUrl = imageMatch?.[1];
      if (!imageUrl) continue;

      const [beforeImage, afterImage] = value.split(imageMatch[0]);

      requests.push(
        {
          replaceAllText: {
            replaceText: "",
            containsText: {
              text: placeholder,
              matchCase: false,
            },
          },
        },
        ...(beforeImage?.trim()
          ? [
              {
                insertText: {
                  text: beforeImage,
                  location: { index: null }, // Dynamic placeholder replacement
                },
              },
            ]
          : []),
        {
          insertInlineImage: {
            uri: imageUrl,
            location: { index: null }, // Dynamic placeholder replacement
          },
        },
        ...(afterImage?.trim()
          ? [
              {
                insertText: {
                  text: afterImage,
                  location: { index: null }, // Dynamic placeholder replacement
                },
              },
            ]
          : []),
      );
    }
    // Handle text replacement
    else {
      requests.push({
        replaceAllText: {
          replaceText: valueStr,
          containsText: {
            text: placeholder,
            matchCase: false,
          },
        },
      });
    }
  }

  // Batch update requests
  if (requests.length > 0) {
    await googleDocs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests,
      },
    });
  }
}

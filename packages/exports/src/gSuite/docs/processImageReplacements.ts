import type { docs_v1 } from "@googleapis/docs";

import { findPlaceholderIndex } from "./findPlaceholderIndex";

export async function processImageReplacements<
  Data extends Record<string, string | string[] | null | undefined>,
>({
  googleDocs,
  documentId,
  data,
}: {
  googleDocs: docs_v1.Docs;
  documentId: string;
  data: Data;
}) {
  // The method here is too locate the placeholder in the documents, delete it, and insert the image.
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string" && value.includes("![image](")) {
      const imageUrl = value.match(/!\[.*?\]\((.*?)\)/)?.[1];
      if (!imageUrl) continue;

      const placeholder = `{{${key}}}`;
      const index = await findPlaceholderIndex(
        googleDocs,
        documentId,
        placeholder,
      );

      if (index !== null) {
        await googleDocs.documents.batchUpdate({
          documentId,
          requestBody: {
            requests: [
              {
                deleteContentRange: {
                  range: {
                    startIndex: index,
                    endIndex: index + placeholder.length,
                  },
                },
              },
            ],
          },
        });

        await googleDocs.documents.batchUpdate({
          documentId,
          requestBody: {
            requests: [
              {
                insertInlineImage: {
                  uri: imageUrl,
                  location: {
                    segmentId: null,
                    index,
                  },
                },
              },
            ],
          },
        });
      }
    }
  }
}

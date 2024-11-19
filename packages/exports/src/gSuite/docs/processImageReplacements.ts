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
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string" && value.includes("![image](")) {
      // Extract image URL
      const imageMatch = value.match(/!\[.*?\]\((.*?)\)/);
      const imageUrl = imageMatch?.[1];
      if (!imageUrl) continue;

      // Extract surrounding text before and after the image placeholder
      const [beforeImage, afterImage] = value.split(imageMatch[0]);

      const placeholder = `{{${key}}}`;
      const index = await findPlaceholderIndex(
        googleDocs,
        documentId,
        placeholder,
      );

      if (index !== null) {
        // Delete the entire placeholder
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

        // Insert the before text
        if (beforeImage?.trim()) {
          await googleDocs.documents.batchUpdate({
            documentId,
            requestBody: {
              requests: [
                {
                  insertText: {
                    text: beforeImage,
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

        // Insert the image
        await googleDocs.documents.batchUpdate({
          documentId,
          requestBody: {
            requests: [
              {
                insertInlineImage: {
                  uri: imageUrl,
                  location: {
                    segmentId: null,
                    index: beforeImage ? index + beforeImage.length : index,
                  },
                },
              },
            ],
          },
        });

        // Insert the after text
        if (afterImage?.trim()) {
          await googleDocs.documents.batchUpdate({
            documentId,
            requestBody: {
              requests: [
                {
                  insertText: {
                    text: afterImage,
                    location: {
                      segmentId: null,
                      index: beforeImage
                        ? index + beforeImage.length + 1
                        : index + 1, // Adjust index to account for image insertion
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
}

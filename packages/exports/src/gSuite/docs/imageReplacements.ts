import type { docs_v1 } from "@googleapis/docs";

import { findPlaceholderIndex } from "./findPlaceholderIndex";

export async function imageReplacements({
  googleDocs,
  documentId,
}: {
  googleDocs: docs_v1.Docs;
  documentId: string;
}): Promise<{ requests: docs_v1.Schema$Request[] }> {
  const { data } = await googleDocs.documents.get({ documentId });
  // const requests: docs_v1.Schema$Request[] = [];

  if (!data.body || !data.body.content) {
    throw new Error("Document is empty or invalid.");
  }

  // Traverse the document's body content
  const content = data.body.content;

  const requests = extractImageRequests(content);

  // Uncomment to execute requests
  // await googleDocs.documents.batchUpdate({
  //   documentId,
  //   requestBody: { requests },
  // });

  return { requests };
}

function extractImageRequests(
  content: any,
  startIndex: number = 0,
): docs_v1.Schema$Request[] {
  const requests: docs_v1.Schema$Request[] = [];

  const traverseAndCollect = (obj: any, index: number) => {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        traverseAndCollect(item, index);
      }
    } else if (obj && typeof obj === "object") {
      for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (typeof value === "string") {
          // Regex to detect Markdown image syntax
          const markdownImageRegex = /!\[.*?\]\((.*?)\)/g;
          let match;
          while ((match = markdownImageRegex.exec(value)) !== null) {
            const url = match[1];
            const imageRequest: docs_v1.Schema$Request = {
              insertInlineImage: {
                uri: url,
                location: { index },
              },
            };
            requests.push(imageRequest);

            // Adjust index for where subsequent images should be inserted
            index += 1;
          }
        } else {
          traverseAndCollect(value, index);
        }
      }
    }
  };

  traverseAndCollect(content, startIndex);
  return requests;
}

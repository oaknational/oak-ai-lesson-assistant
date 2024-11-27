import type { docs_v1 } from "@googleapis/docs";

/**
 * Helper to find the index of a placeholder in the document.
 */
export async function findPlaceholderIndex(
  googleDocs: docs_v1.Docs,
  documentId: string,
  placeholder: string,
): Promise<number | null> {
  const doc = await googleDocs.documents.get({ documentId });
  const body = doc.data.body?.content;

  if (!body) return null;

  for (const element of body) {
    if (element.table) {
      for (const row of element.table.tableRows || []) {
        for (const cell of row.tableCells || []) {
          for (const cellElement of cell.content || []) {
            if (cellElement.paragraph?.elements) {
              for (const textElement of cellElement.paragraph.elements) {
                if (textElement.textRun?.content?.includes(placeholder)) {
                  return textElement.startIndex ?? null;
                }
              }
            }
          }
        }
      }
    }

    if (element.paragraph?.elements) {
      for (const textElement of element.paragraph.elements) {
        if (textElement.textRun?.content?.includes(placeholder)) {
          return textElement.startIndex ?? null;
        }
      }
    }
  }
  return null;
}

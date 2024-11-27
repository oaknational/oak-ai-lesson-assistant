import type { docs_v1 } from "@googleapis/docs";

/**
 * Helper to find the index of a placeholder (including Markdown syntax) in the document.
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
    // Handle table elements
    if (element.table) {
      for (const row of element.table.tableRows || []) {
        for (const cell of row.tableCells || []) {
          for (const cellElement of cell.content || []) {
            const index = findInParagraph(cellElement, placeholder);
            if (index !== null) return index;
          }
        }
      }
    }

    // Handle regular paragraphs
    if (element.paragraph) {
      const index = findInParagraph(element, placeholder);
      if (index !== null) return index;
    }
  }

  return null;
}

/**
 * Helper to find placeholder in a paragraph or similar structure.
 */
function findInParagraph(
  element: docs_v1.Schema$StructuralElement,
  placeholder: string,
): number | null {
  if (!element.paragraph?.elements) return null;

  for (const textElement of element.paragraph.elements) {
    if (textElement.textRun?.content?.includes(placeholder)) {
      return textElement.startIndex ?? null;
    }
  }

  return null;
}

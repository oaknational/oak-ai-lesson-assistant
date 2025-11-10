import type { docs_v1 } from "@googleapis/docs";

/**
 * Extract all text content from Google Doc structural elements
 * Traverses paragraphs and table cells to collect all text
 */
export function extractTextFromDocument(
  elements: docs_v1.Schema$StructuralElement[],
): string {
  let text = "";

  for (const element of elements) {
    // Extract from paragraphs
    if (element.paragraph?.elements) {
      for (const textElement of element.paragraph.elements) {
        if (textElement.textRun?.content) {
          text += textElement.textRun.content;
        }
      }
    }

    // Extract from tables
    if (element.table?.tableRows) {
      for (const row of element.table.tableRows) {
        for (const cell of row.tableCells ?? []) {
          for (const cellElement of cell.content ?? []) {
            if (cellElement.paragraph?.elements) {
              for (const textElement of cellElement.paragraph.elements) {
                if (textElement.textRun?.content) {
                  text += textElement.textRun.content;
                }
              }
            }
          }
        }
      }
    }
  }

  return text;
}

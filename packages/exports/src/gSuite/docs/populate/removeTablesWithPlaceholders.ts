import { aiLogger } from "@oakai/logger";

import type { docs_v1 } from "@googleapis/docs";

const log = aiLogger("exports");

export async function removeTablesWithPlaceholders(
  googleDocs: docs_v1.Docs,
  documentId: string,
  targetPlaceholders: string[],
): Promise<docs_v1.Schema$Request[]> {
  const requests: docs_v1.Schema$Request[] = [];

  if (targetPlaceholders.length === 0) {
    return requests;
  }

  const doc = await googleDocs.documents.get({ documentId });
  const bodyContent = doc.data.body?.content ?? [];

  // Find tables to remove and their indexes in the content array
  const tablesToRemove = bodyContent
    .map((element, index) => ({ element, index }))
    .filter(
      ({ element }) =>
        element?.table &&
        element.startIndex &&
        element.endIndex &&
        tableContainsPlaceholders(element.table, targetPlaceholders),
    );

  return tablesToRemove
    .sort((a, b) => b.element.startIndex! - a.element.startIndex!) // Delete from end first
    .map(({ element, index }) => {
      let endIndex = element.endIndex!;

      // Check if the next element is a paragraph with a page break
      const nextElement = bodyContent[index + 1];
      const hasPageBreakElement = nextElement?.paragraph?.elements?.some(
        (el) => !!el.pageBreak,
      );

      if (hasPageBreakElement && nextElement?.endIndex) {
        log.info("Including paragraph with page break in table deletion");
        endIndex = nextElement.endIndex;
      } else {
        log.info("No page break found after table, deleting table only");
      }

      return {
        deleteContentRange: {
          range: {
            startIndex: element.startIndex!,
            endIndex,
          },
        },
      };
    });
}

function tableContainsPlaceholders(
  table: docs_v1.Schema$Table,
  targetPlaceholders: string[],
): boolean {
  for (const row of table.tableRows ?? []) {
    for (const cell of row.tableCells ?? []) {
      for (const cellElement of cell.content ?? []) {
        if (cellElement.paragraph?.elements) {
          for (const textElement of cellElement.paragraph.elements) {
            const text = textElement.textRun?.content ?? "";
            if (
              targetPlaceholders.some((placeholder) =>
                text.includes(placeholder),
              )
            ) {
              return true;
            }
          }
        }
      }
    }
  }
  return false;
}

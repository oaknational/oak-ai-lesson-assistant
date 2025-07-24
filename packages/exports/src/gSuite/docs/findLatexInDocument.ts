import { aiLogger } from "@oakai/logger";

import type { docs_v1 } from "@googleapis/docs";

import { type LatexPattern, findLatexPatterns } from "./findLatexPatterns";

const log = aiLogger("exports");

export interface DocumentLatexPattern extends LatexPattern {
  // Additional context from the document structure
  paragraphIndex?: number;
  tableCell?: { row: number; column: number };
}

function processTextElements(
  elements: docs_v1.Schema$ParagraphElement[],
  patterns: DocumentLatexPattern[],
  context?: {
    paragraphIndex?: number;
    tableCell?: { row: number; column: number };
  },
): void {
  for (const textElement of elements) {
    const textContent = textElement.textRun?.content ?? "";
    const elementStartIndex = textElement.startIndex;

    if (typeof elementStartIndex !== "number" || !textContent) {
      continue;
    }

    // Find LaTeX patterns within this text element
    const elementPatterns = findLatexPatterns(textContent);

    // Adjust pattern indices to document-level indices and add context
    for (const pattern of elementPatterns) {
      patterns.push({
        ...pattern,
        startIndex: elementStartIndex + pattern.startIndex,
        endIndex: elementStartIndex + pattern.endIndex,
        ...context,
      });
    }
  }
}

function processTableCells(
  cells: docs_v1.Schema$TableCell[],
  patterns: DocumentLatexPattern[],
  rowIndex: number,
): void {
  cells.forEach((cell, columnIndex) => {
    for (const cellElement of cell.content ?? []) {
      if (cellElement.paragraph?.elements) {
        processTextElements(cellElement.paragraph.elements, patterns, {
          tableCell: { row: rowIndex, column: columnIndex },
        });
      }
    }
  });
}

function processBodyElements(
  elements: docs_v1.Schema$StructuralElement[],
  patterns: DocumentLatexPattern[],
): void {
  let paragraphIndex = 0;

  for (const element of elements) {
    if (element.table) {
      element.table.tableRows?.forEach((row, rowIndex) => {
        processTableCells(row.tableCells ?? [], patterns, rowIndex);
      });
    }

    if (element.paragraph?.elements) {
      processTextElements(element.paragraph.elements, patterns, {
        paragraphIndex,
      });
      paragraphIndex++;
    }
  }
}

/**
 * Find all LaTeX patterns in a Google Doc
 * Returns patterns with document-level indices
 */
export async function findLatexInDocument(
  googleDocs: docs_v1.Docs,
  documentId: string,
): Promise<DocumentLatexPattern[]> {
  try {
    const doc = await googleDocs.documents.get({ documentId });
    const body = doc.data.body?.content;

    if (!body) {
      log.info("No document body found");
      return [];
    }

    const patterns: DocumentLatexPattern[] = [];
    processBodyElements(body, patterns);

    // Sort by document position
    patterns.sort((a, b) => a.startIndex - b.startIndex);

    log.info(
      `Found ${patterns.length} LaTeX patterns in document ${documentId}`,
    );
    return patterns;
  } catch (error) {
    log.error(`Failed to find LaTeX in document ${documentId}`, error);
    throw error;
  }
}

import type { GoogleSlidesTable } from "@oakai/gsuite";

import { extractTextFromTextElements } from "./extractTextFromTextElements";
import { generateCellId } from "./generateCellId";
import type { SlideTableCell } from "./types";

/**
 * Extracts cell contents from a Google Slides table with composite IDs
 *
 * Each cell gets an ID in format {tableId}_r{row}c{col} that LLMs can use
 * to reference specific cells in their responses.
 *
 * @param tableId - The Google Slides objectId of the table
 * @param table - The table schema object
 * @returns 2D array of cells with IDs [row][col]
 */
export function extractTableCells(
  tableId: string,
  table: GoogleSlidesTable,
): SlideTableCell[][] {
  const cells: SlideTableCell[][] = [];

  table.tableRows?.forEach((row, rowIndex) => {
    const rowCells: SlideTableCell[] = [];

    row.tableCells?.forEach((cell, colIndex) => {
      const cellText = extractTextFromTextElements(cell.text?.textElements);
      rowCells.push({
        id: generateCellId(tableId, rowIndex, colIndex),
        content: cellText ?? "",
        row: rowIndex,
        col: colIndex,
      });
    });

    cells.push(rowCells);
  });

  return cells;
}

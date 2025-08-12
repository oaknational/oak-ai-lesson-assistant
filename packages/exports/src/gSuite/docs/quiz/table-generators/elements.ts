/**
 * Element creation functions for quiz table generation
 */
import type { docs_v1 } from "@googleapis/docs";

import { ANSWER_BOX_IMAGE_URL, ANSWER_BOX_SIZE } from "./constants";
import { calculateCellIndices, pxToPt } from "./helpers";
import type { QuizElement } from "./types";

/**
 * Create a text element (question text, instructions, etc.)
 */
export function createTextElement(
  insertIndex: number,
  text: string,
): QuizElement {
  return {
    type: "text",
    requests: [
      {
        insertText: {
          location: { index: insertIndex },
          text,
        },
      },
    ],
  };
}

/**
 * Create a spacer element for visual separation
 */
export function createSpacerElement(insertIndex: number): QuizElement {
  return {
    type: "spacer",
    requests: [
      {
        insertText: {
          location: { index: insertIndex },
          text: "\n\n",
        },
      },
    ],
  };
}

/**
 * Create a complete table element with all its operations
 * This includes table creation, cell population, and styling
 */
export function createTableElement(
  insertIndex: number,
  rows: number,
  columns: number,
  cellContent: (row: number, col: number) => string,
  columnWidths: number[],
): QuizElement {
  const requests: docs_v1.Schema$Request[] = [];

  // 1. Create the table structure
  requests.push({
    insertTable: {
      location: { index: insertIndex },
      rows,
      columns,
    },
  });

  // 2. Populate cells (backwards to avoid index shifting)
  const cellIndices = calculateCellIndices(insertIndex, rows, columns);

  for (let i = cellIndices.length - 1; i >= 0; i--) {
    const row = Math.floor(i / columns);
    const col = i % columns;
    const content = cellContent(row, col);

    if (content === "☐") {
      // Insert answer box image instead of checkbox character
      requests.push({
        insertInlineImage: {
          location: { index: cellIndices[i] },
          uri: ANSWER_BOX_IMAGE_URL,
          objectSize: {
            height: {
              magnitude: pxToPt(ANSWER_BOX_SIZE),
              unit: "PT",
            },
            width: {
              magnitude: pxToPt(ANSWER_BOX_SIZE),
              unit: "PT",
            },
          },
        },
      });
    } else if (content) {
      requests.push({
        insertText: {
          location: { index: cellIndices[i] },
          text: content,
        },
      });
    }
  }

  // 3. Remove borders and set horizontal padding only
  requests.push({
    updateTableCellStyle: {
      tableCellStyle: {
        contentAlignment: "MIDDLE",
        paddingLeft: { magnitude: 0, unit: "PT" },
        paddingRight: { magnitude: 5, unit: "PT" },
        borderTop: {
          width: { magnitude: 0, unit: "PT" },
          color: { color: { rgbColor: { red: 1, green: 1, blue: 1 } } },
          dashStyle: "SOLID",
        },
        borderBottom: {
          width: { magnitude: 0, unit: "PT" },
          color: { color: { rgbColor: { red: 1, green: 1, blue: 1 } } },
          dashStyle: "SOLID",
        },
        borderLeft: {
          width: { magnitude: 0, unit: "PT" },
          color: { color: { rgbColor: { red: 1, green: 1, blue: 1 } } },
          dashStyle: "SOLID",
        },
        borderRight: {
          width: { magnitude: 0, unit: "PT" },
          color: { color: { rgbColor: { red: 1, green: 1, blue: 1 } } },
          dashStyle: "SOLID",
        },
      },
      tableRange: {
        tableCellLocation: {
          tableStartLocation: { index: insertIndex + 1 },
          rowIndex: 0,
          columnIndex: 0,
        },
        rowSpan: rows,
        columnSpan: columns,
      },
      fields:
        "contentAlignment,paddingLeft,paddingRight,borderTop,borderBottom,borderLeft,borderRight",
    },
  });

  // 4. Set column widths
  columnWidths.forEach((width, index) => {
    requests.push({
      updateTableColumnProperties: {
        tableStartLocation: { index: insertIndex + 1 },
        columnIndices: [index],
        tableColumnProperties: {
          widthType: "FIXED_WIDTH",
          width: { magnitude: width, unit: "PT" },
        },
        fields: "widthType,width",
      },
    });
  });

  return {
    type: "table",
    requests,
  };
}

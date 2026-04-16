/**
 * Element creation functions for quiz table generation
 */
import type { docs_v1 } from "@googleapis/docs";
import invariant from "tiny-invariant";

import {
  ANSWER_BOX_IMAGE_URL,
  ANSWER_BOX_SIZE,
  CHECKBOX_PLACEHOLDER,
} from "./constants";
import { calculateCellIndices, pxToPt } from "./helpers";
import type { CreateTableElementOptions, QuizElement } from "./types";

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

export function createTableElement(
  options: CreateTableElementOptions,
): QuizElement {
  const {
    insertIndex,
    rows,
    columns,
    cellContent,
    columnWidths,
    columnAlignments,
  } = options;
  const requests: docs_v1.Schema$Request[] = [];

  // 1. Create the table structure
  requests.push({
    insertTable: {
      location: { index: insertIndex },
      rows,
      columns,
    },
  });

  const cellIndices = calculateCellIndices(insertIndex, rows, columns);

  // 2. Apply column-specific paragraph alignments
  if (columnAlignments) {
    columnAlignments.forEach((alignment, colIndex) => {
      if (!alignment) return; // Skip null alignments

      // Apply alignment to all cells in this column
      for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        const cellStartIndex = cellIndices[rowIndex * columns + colIndex];
        invariant(cellStartIndex, `Cell index missing ${rowIndex}:${colIndex}`);

        requests.push({
          updateParagraphStyle: {
            range: {
              startIndex: cellStartIndex,
              endIndex: cellStartIndex + 1,
            },
            paragraphStyle: {
              alignment,
            },
            fields: "alignment",
          },
        });
      }
    });
  }

  // 3. Populate cells (backwards to avoid index shifting)
  for (let i = cellIndices.length - 1; i >= 0; i--) {
    const row = Math.floor(i / columns);
    const col = i % columns;
    const content = cellContent(row, col);

    if (content === CHECKBOX_PLACEHOLDER) {
      // Replace checkbox placeholder with answer box image
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

  // 4. Remove borders and set horizontal padding only
  requests.push({
    updateTableCellStyle: {
      tableCellStyle: {
        contentAlignment: "MIDDLE",
        paddingLeft: { magnitude: 0, unit: "PT" },
        paddingRight: { magnitude: 2, unit: "PT" },
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

  // 5. Set column widths (skip AUTO columns to let them fill remaining space)
  columnWidths.forEach((width, index) => {
    // Skip AUTO columns - let them fill remaining space
    if (width === "AUTO") return;

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

/**
 * Quiz table generators using element-based composition
 * Each element (text, table, spacer) is self-contained with all its operations
 */
import { docs_v1 } from "@googleapis/docs";

// Standard column widths in points
const COLUMN_WIDTHS = {
  checkbox: 20,
  letter: 25,
  spacer: 10,
  textNarrow: 140,
  textWide: 400,
  textFull: 425,
} as const;

/**
 * Base interface for all quiz elements
 */
interface QuizElement {
  type: "text" | "table" | "spacer";
  requests: docs_v1.Schema$Request[];
}

/**
 * Calculate cell insertion indices for a table
 * Formula verified: first cell at tableStart + 4, then +2 per cell, +1 per row
 */
export function calculateCellIndices(
  tableStartIndex: number,
  rows: number,
  columns: number,
): number[] {
  const indices: number[] = [];
  let idx = tableStartIndex + 4; // First cell's insertion point

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      indices.push(idx);
      idx += 2; // Each cell takes 2 indices
    }
    idx += 1; // Row boundary adds 1
  }

  return indices;
}

/**
 * Create a text element (question text, instructions, etc.)
 */
function createTextElement(
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
function createSpacerElement(insertIndex: number): QuizElement {
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
function createTableElement(
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

    if (content) {
      requests.push({
        insertText: {
          location: { index: cellIndices[i] },
          text: content,
        },
      });
    }
  }

  // 3. Remove borders
  requests.push({
    updateTableCellStyle: {
      tableCellStyle: {
        contentAlignment: "MIDDLE",
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
      fields: "contentAlignment,borderTop,borderBottom,borderLeft,borderRight",
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

/**
 * Generate requests for a multiple choice question table
 * Layout: 3 columns (checkbox | letter | answer text)
 */
export function generateMultipleChoiceTable(
  insertIndex: number,
  question: string,
  questionNumber: number,
  answers: string[],
): docs_v1.Schema$Request[] {
  const elements: QuizElement[] = [];

  // Question text element
  elements.push(
    createTextElement(insertIndex, `${questionNumber}. ${question}`)
  );

  // Answer table element
  const cellContent = (row: number, col: number): string => {
    if (col === 0) return "☐";
    if (col === 1) return `${String.fromCharCode(97 + row)})`;
    return answers[row];
  };

  elements.push(
    createTableElement(
      insertIndex,
      answers.length,
      3,
      cellContent,
      [COLUMN_WIDTHS.checkbox, COLUMN_WIDTHS.letter, COLUMN_WIDTHS.textWide]
    )
  );

  // Reverse elements and flatten requests
  elements.reverse();
  return elements.flatMap(e => e.requests);
}

/**
 * Generate requests for a matching pairs question table
 * Layout: 5 columns (letter | left text | spacer | checkbox | right text)
 */
export function generateMatchingPairsTable(
  insertIndex: number,
  question: string,
  questionNumber: number,
  leftItems: string[],
  rightItems: string[],
): docs_v1.Schema$Request[] {
  const elements: QuizElement[] = [];
  const rows = Math.max(leftItems.length, rightItems.length);

  // Question text element
  elements.push(
    createTextElement(insertIndex, `${questionNumber}. ${question}`)
  );

  // Matching table element
  const cellContent = (row: number, col: number): string => {
    if (col === 0 && row < leftItems.length) {
      return `${String.fromCharCode(97 + row)})`;
    }
    if (col === 1 && row < leftItems.length) {
      return leftItems[row];
    }
    if (col === 2) return ""; // Spacer column
    if (col === 3 && row < rightItems.length) {
      return "☐";
    }
    if (col === 4 && row < rightItems.length) {
      return rightItems[row];
    }
    return "";
  };

  elements.push(
    createTableElement(
      insertIndex,
      rows,
      5,
      cellContent,
      [
        COLUMN_WIDTHS.letter,
        COLUMN_WIDTHS.textNarrow,
        COLUMN_WIDTHS.spacer,
        COLUMN_WIDTHS.checkbox,
        COLUMN_WIDTHS.textNarrow,
      ]
    )
  );

  // Reverse elements and flatten requests
  elements.reverse();
  return elements.flatMap(e => e.requests);
}

/**
 * Generate requests for an ordering question table
 * Layout: 2 columns (checkbox | item text)
 */
export function generateOrderingTable(
  insertIndex: number,
  question: string,
  questionNumber: number,
  items: string[],
): docs_v1.Schema$Request[] {
  const elements: QuizElement[] = [];

  // Question text element
  elements.push(
    createTextElement(insertIndex, `${questionNumber}. ${question}`)
  );

  // Items table element
  const cellContent = (row: number, col: number): string => {
    if (col === 0) return "☐";
    return items[row];
  };

  elements.push(
    createTableElement(
      insertIndex,
      items.length,
      2,
      cellContent,
      [COLUMN_WIDTHS.checkbox, COLUMN_WIDTHS.textFull]
    )
  );

  // Reverse elements and flatten requests
  elements.reverse();
  return elements.flatMap(e => e.requests);
}

/**
 * Generate requests for a short answer question (no table needed)
 * Uses repeated ▁ character for answer line
 */
export function generateShortAnswerQuestion(
  insertIndex: number,
  question: string,
  questionNumber: number,
  isInline: boolean = false,
): docs_v1.Schema$Request[] {
  const answerLine = "▁".repeat(10);
  
  if (isInline) {
    const placeholderPattern = /____+/;
    const text = question.replace(placeholderPattern, answerLine);
    return [
      {
        insertText: {
          location: { index: insertIndex },
          text: `${questionNumber}. ${text}\n`,
        },
      },
    ];
  } else {
    return [
      {
        insertText: {
          location: { index: insertIndex },
          text: `${questionNumber}. ${question}\n\n${answerLine}\n`,
        },
      },
    ];
  }
}

/**
 * Generate all quiz tables using element-based composition
 * Processes questions in forward order, then reverses for execution
 */
export function generateAllQuizTables(
  insertIndex: number,
  questions: Array<{
    type: "multiple-choice" | "match" | "order" | "short-answer";
    question: string;
    data: any;
  }>,
): docs_v1.Schema$Request[] {
  const allElements: QuizElement[] = [];

  // Generate elements for each question in forward order
  questions.forEach((q, index) => {
    const questionNumber = index + 1;
    
    // Add spacing before each question (except first)
    if (index > 0) {
      allElements.push(createSpacerElement(insertIndex));
    }

    // Generate question-specific elements
    let elements: QuizElement[] = [];
    
    switch (q.type) {
      case "multiple-choice":
        // Create elements inline
        elements.push(
          createTextElement(insertIndex, `${questionNumber}. ${q.question}`)
        );
        const mcCellContent = (row: number, col: number): string => {
          if (col === 0) return "☐";
          if (col === 1) return `${String.fromCharCode(97 + row)})`;
          return q.data.answers[row];
        };
        elements.push(
          createTableElement(
            insertIndex,
            q.data.answers.length,
            3,
            mcCellContent,
            [COLUMN_WIDTHS.checkbox, COLUMN_WIDTHS.letter, COLUMN_WIDTHS.textWide]
          )
        );
        break;
        
      case "match":
        // Create elements inline
        const rows = Math.max(q.data.leftItems.length, q.data.rightItems.length);
        elements.push(
          createTextElement(insertIndex, `${questionNumber}. ${q.question}`)
        );
        const matchCellContent = (row: number, col: number): string => {
          if (col === 0 && row < q.data.leftItems.length) {
            return `${String.fromCharCode(97 + row)})`;
          }
          if (col === 1 && row < q.data.leftItems.length) {
            return q.data.leftItems[row];
          }
          if (col === 2) return "";
          if (col === 3 && row < q.data.rightItems.length) {
            return "☐";
          }
          if (col === 4 && row < q.data.rightItems.length) {
            return q.data.rightItems[row];
          }
          return "";
        };
        elements.push(
          createTableElement(
            insertIndex,
            rows,
            5,
            matchCellContent,
            [
              COLUMN_WIDTHS.letter,
              COLUMN_WIDTHS.textNarrow,
              COLUMN_WIDTHS.spacer,
              COLUMN_WIDTHS.checkbox,
              COLUMN_WIDTHS.textNarrow,
            ]
          )
        );
        break;
        
      case "order":
        // Create elements inline
        elements.push(
          createTextElement(insertIndex, `${questionNumber}. ${q.question}`)
        );
        const orderCellContent = (row: number, col: number): string => {
          if (col === 0) return "☐";
          return q.data.items[row];
        };
        elements.push(
          createTableElement(
            insertIndex,
            q.data.items.length,
            2,
            orderCellContent,
            [COLUMN_WIDTHS.checkbox, COLUMN_WIDTHS.textFull]
          )
        );
        break;
        
      case "short-answer":
        // Short answer is just text, no table
        const answerLine = "▁".repeat(10);
        if (q.data.isInline) {
          const placeholderPattern = /____+/;
          const text = q.question.replace(placeholderPattern, answerLine);
          elements.push(
            createTextElement(insertIndex, `${questionNumber}. ${text}\n`)
          );
        } else {
          elements.push(
            createTextElement(
              insertIndex,
              `${questionNumber}. ${q.question}\n\n${answerLine}\n`
            )
          );
        }
        break;
    }
    
    allElements.push(...elements);
  });

  // Reverse all elements for backwards insertion
  allElements.reverse();
  
  // Flatten all requests from reversed elements
  return allElements.flatMap(element => element.requests);
}
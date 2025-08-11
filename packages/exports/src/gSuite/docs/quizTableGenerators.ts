/**
 * Quiz table generation functions using backwards insertion approach
 * Each function generates the requests needed to create and populate a table for a specific question type
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
 * Generate a spacer between questions
 */
function generateQuestionSpacer(insertIndex: number): docs_v1.Schema$Request {
  return {
    insertText: {
      location: { index: insertIndex },
      text: "\n\n",
    },
  };
}

/**
 * Generate requests to set column widths for a table
 */
function generateColumnWidthRequests(
  tableStartIndex: number,
  columnWidths: number[]
): docs_v1.Schema$Request[] {
  return columnWidths.map((width, index) => ({
    updateTableColumnProperties: {
      tableStartLocation: { index: tableStartIndex },
      columnIndices: [index],
      tableColumnProperties: {
        widthType: "FIXED_WIDTH",
        width: { magnitude: width, unit: "PT" },
      },
      fields: "widthType,width",
    },
  }));
}

/**
 * Generate a request to remove borders from table cells
 */
function generateRemoveBordersRequest(
  insertIndex: number,
  rows: number,
  columns: number
): docs_v1.Schema$Request {
  return {
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
  };
}

/**
 * Calculate cell insertion indices for a table
 * Formula verified: first cell at tableStart + 4, then +2 per cell, +1 per row
 */
export function calculateCellIndices(
  tableStartIndex: number,
  rows: number,
  columns: number
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
 * Generate requests for a multiple choice question table
 * Layout: 3 columns (checkbox | letter | answer text)
 */
export function generateMultipleChoiceTable(
  insertIndex: number,
  question: string,
  questionNumber: number,
  answers: string[]
): docs_v1.Schema$Request[] {
  const requests: docs_v1.Schema$Request[] = [];
  const rows = answers.length;
  const columns = 3;
  
  // Insert table first (backwards insertion approach)
  requests.push({
    insertTable: {
      location: { index: insertIndex },
      rows,
      columns,
    },
  });
  
  // Calculate cell indices
  const cellIndices = calculateCellIndices(insertIndex, rows, columns);
  
  // Populate cells backwards
  for (let i = cellIndices.length - 1; i >= 0; i--) {
    const row = Math.floor(i / columns);
    const col = i % columns;
    
    let content = "";
    if (col === 0) {
      // Checkbox column
      content = "☐";
    } else if (col === 1) {
      // Letter column
      content = `${String.fromCharCode(97 + row)})`;  // a), b), c), etc.
    } else {
      // Answer text column
      content = answers[row];
    }
    
    if (content) {
      requests.push({
        insertText: {
          location: { index: cellIndices[i] },
          text: content,
        },
      });
    }
  }
  
  // Style table cells
  requests.push(generateRemoveBordersRequest(insertIndex, rows, columns));
  
  // Set column widths
  requests.push(...generateColumnWidthRequests(insertIndex + 1, [
    COLUMN_WIDTHS.checkbox,
    COLUMN_WIDTHS.letter,
    COLUMN_WIDTHS.textWide,
  ]));
  
  // Add question text
  requests.push({
    insertText: {
      location: { index: insertIndex },
      text: `${questionNumber}. ${question}`,
    },
  });
  
  return requests;
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
  rightItems: string[]
): docs_v1.Schema$Request[] {
  const requests: docs_v1.Schema$Request[] = [];
  const rows = Math.max(leftItems.length, rightItems.length);
  const columns = 5;
  
  // Insert table first (backwards insertion approach)
  requests.push({
    insertTable: {
      location: { index: insertIndex },
      rows,
      columns,
    },
  });
  
  // Calculate cell indices
  const cellIndices = calculateCellIndices(insertIndex, rows, columns);
  
  // Populate cells backwards
  for (let i = cellIndices.length - 1; i >= 0; i--) {
    const row = Math.floor(i / columns);
    const col = i % columns;
    
    let content = "";
    if (col === 0) {
      // Letter column (left side)
      if (row < leftItems.length) {
        content = `${String.fromCharCode(97 + row)})`;
      }
    } else if (col === 1) {
      // Left text column
      if (row < leftItems.length) {
        content = leftItems[row];
      }
    } else if (col === 2) {
      // Spacer column - leave empty
      content = "";
    } else if (col === 3) {
      // Answer box column (between left and right)
      if (row < rightItems.length) {
        content = "☐";
      }
    } else if (col === 4) {
      // Right text column
      if (row < rightItems.length) {
        content = rightItems[row];
      }
    }
    
    if (content) {
      requests.push({
        insertText: {
          location: { index: cellIndices[i] },
          text: content,
        },
      });
    }
  }
  
  // Style table cells
  requests.push(generateRemoveBordersRequest(insertIndex, rows, columns));
  
  // Set column widths (matching pairs should have equal text widths)
  requests.push(...generateColumnWidthRequests(insertIndex + 1, [
    COLUMN_WIDTHS.letter,
    COLUMN_WIDTHS.textNarrow,
    COLUMN_WIDTHS.spacer,
    COLUMN_WIDTHS.checkbox,
    COLUMN_WIDTHS.textNarrow,
  ]));
  
  // Add question text
  requests.push({
    insertText: {
      location: { index: insertIndex },
      text: `${questionNumber}. ${question}`,
    },
  });
  
  return requests;
}

/**
 * Generate requests for an ordering question table
 * Layout: 2 columns (checkbox | item text)
 */
export function generateOrderingTable(
  insertIndex: number,
  question: string,
  questionNumber: number,
  items: string[]
): docs_v1.Schema$Request[] {
  const requests: docs_v1.Schema$Request[] = [];
  const rows = items.length;
  const columns = 2;
  
  // Insert table first (backwards insertion approach)
  requests.push({
    insertTable: {
      location: { index: insertIndex },
      rows,
      columns,
    },
  });
  
  // Calculate cell indices
  const cellIndices = calculateCellIndices(insertIndex, rows, columns);
  
  // Populate cells backwards
  for (let i = cellIndices.length - 1; i >= 0; i--) {
    const row = Math.floor(i / columns);
    const col = i % columns;
    
    let content = "";
    if (col === 0) {
      // Checkbox column
      content = "☐";
    } else {
      // Item text column
      content = items[row];
    }
    
    if (content) {
      requests.push({
        insertText: {
          location: { index: cellIndices[i] },
          text: content,
        },
      });
    }
  }
  
  // Style table cells
  requests.push(generateRemoveBordersRequest(insertIndex, rows, columns));
  
  // Set column widths
  requests.push(...generateColumnWidthRequests(insertIndex + 1, [
    COLUMN_WIDTHS.checkbox,
    COLUMN_WIDTHS.textFull,
  ]));
  
  // Add question text
  requests.push({
    insertText: {
      location: { index: insertIndex },
      text: `${questionNumber}. ${question}`,
    },
  });
  
  return requests;
}

/**
 * Generate requests for a short answer question (no table needed)
 * Uses repeated ▁ character for answer line
 */
export function generateShortAnswerQuestion(
  insertIndex: number,
  question: string,
  questionNumber: number,
  isInline: boolean = false
): docs_v1.Schema$Request[] {
  const requests: docs_v1.Schema$Request[] = [];
  const answerLine = "▁".repeat(10); // 10 low line characters
  
  if (isInline) {
    // Inline format: "The answer is ______"
    // We need to find where to insert the line within the question
    const placeholderPattern = /____+/;
    const text = question.replace(placeholderPattern, answerLine);
    
    requests.push({
      insertText: {
        location: { index: insertIndex },
        text: `${questionNumber}. ${text}\n`,
      },
    });
  } else {
    // Separate line format
    requests.push({
      insertText: {
        location: { index: insertIndex },
        text: `${questionNumber}. ${question}\n\n${answerLine}\n`,
      },
    });
  }
  
  return requests;
}

/**
 * Generate all quiz tables using backwards insertion
 * Processes questions in reverse order to avoid index shifting
 */
export function generateAllQuizTables(
  insertIndex: number,
  questions: Array<{
    type: "multiple-choice" | "match" | "order" | "short-answer";
    question: string;
    data: any;
  }>
): docs_v1.Schema$Request[] {
  const allRequests: docs_v1.Schema$Request[] = [];
  
  // Process questions backwards
  for (let i = questions.length - 1; i >= 0; i--) {
    const q = questions[i];
    const questionNumber = i + 1;
    
    // Add spacing before each question (except the last one when working backwards)
    if (i < questions.length - 1) {
      allRequests.push(generateQuestionSpacer(insertIndex));
    }
    
    let requests: docs_v1.Schema$Request[] = [];
    
    switch (q.type) {
      case "multiple-choice":
        requests = generateMultipleChoiceTable(
          insertIndex,
          q.question,
          questionNumber,
          q.data.answers
        );
        break;
        
      case "match":
        requests = generateMatchingPairsTable(
          insertIndex,
          q.question,
          questionNumber,
          q.data.leftItems,
          q.data.rightItems
        );
        break;
        
      case "order":
        requests = generateOrderingTable(
          insertIndex,
          q.question,
          questionNumber,
          q.data.items
        );
        break;
        
      case "short-answer":
        requests = generateShortAnswerQuestion(
          insertIndex,
          q.question,
          questionNumber,
          q.data.isInline || false
        );
        break;
    }
    
    allRequests.push(...requests);
  }
  
  return allRequests;
}
/**
 * Multiple choice question generator
 */
import type { docs_v1 } from "@googleapis/docs";

import {
  addInstruction,
  processBlankPlaceholders,
} from "../../../../../quiz-utils/formatting";
import { shuffleMultipleChoiceAnswers } from "../../../../../quiz-utils/shuffle";
import { CHECKBOX_PLACEHOLDER, COLUMN_WIDTHS } from "../constants";
import { createTableElement, createTextElement } from "../elements";
import { hasImageOnlyAnswers } from "../helpers";
import type { QuizElement } from "../types";

/**
 * Generate elements for a multiple choice question table
 * Layout: 3 columns (checkbox | letter | answer text) for text answers
 *         4 columns (one per answer) for image answers
 */
export function generateMultipleChoiceTable(
  insertIndex: number,
  question: string,
  questionNumber: number,
  answers: string[],
  correctAnswerCount: number,
  distractors: string[],
): QuizElement[] {
  // Check if all answers are image-based
  if (hasImageOnlyAnswers(answers, distractors)) {
    return generateImageMultipleChoiceTable(
      insertIndex,
      question,
      questionNumber,
      answers,
      correctAnswerCount,
      distractors,
    );
  }
  const elements: QuizElement[] = [];

  // Shuffle answers and distractors deterministically
  const shuffledChoices = shuffleMultipleChoiceAnswers(answers, distractors);

  // Add instruction based on number of correct answers
  const instruction =
    correctAnswerCount > 1
      ? `Tick ${correctAnswerCount} correct answers.`
      : "Tick 1 correct answer.";

  // Question text element with properly formatted instruction
  const questionWithBlanks = processBlankPlaceholders(question);
  const formattedQuestion = addInstruction(questionWithBlanks, instruction);
  elements.push(
    createTextElement(insertIndex, `${questionNumber}. ${formattedQuestion}`),
  );

  // Answer table element
  const cellContent = (row: number, col: number): string => {
    // Column 0: Answer checkboxes
    if (col === 0) return CHECKBOX_PLACEHOLDER;
    // Column 1: Letter labels (a), b), c), etc.)
    if (col === 1) return `${String.fromCharCode(97 + row)})`;
    // Column 2: Answer text content
    return shuffledChoices[row]?.text ?? "";
  };

  elements.push(
    createTableElement({
      insertIndex,
      rows: shuffledChoices.length,
      columns: 3,
      cellContent,
      columnWidths: [
        COLUMN_WIDTHS.checkbox,
        COLUMN_WIDTHS.letter,
        COLUMN_WIDTHS.auto,
      ],
      columnAlignments: [null, "CENTER", null],
    }),
  );

  return elements;
}

/**
 * Generate elements for image-based multiple choice question
 * Layout: N columns (one per answer), 2 rows (content, then answer box + letter)
 * Note: Google Docs automatically constrains images to fit within table cells
 */
export function generateImageMultipleChoiceTable(
  insertIndex: number,
  question: string,
  questionNumber: number,
  answers: string[],
  correctAnswerCount: number,
  distractors: string[],
): QuizElement[] {
  const elements: QuizElement[] = [];

  // Shuffle answers and distractors deterministically
  const shuffledChoices = shuffleMultipleChoiceAnswers(answers, distractors);

  // Add instruction based on number of correct answers
  const instruction =
    correctAnswerCount > 1
      ? `Tick ${correctAnswerCount} correct answers.`
      : "Tick 1 correct answer.";

  // Question text element with properly formatted instruction
  const questionWithBlanks = processBlankPlaceholders(question);
  const formattedQuestion = addInstruction(questionWithBlanks, instruction);
  elements.push(
    createTextElement(insertIndex, `${questionNumber}. ${formattedQuestion}`),
  );

  const numColumns = shuffledChoices.length;

  // Answer table element with N columns (one per answer) and 2 rows
  const cellContent = (row: number, col: number): string => {
    if (row === 0) {
      // First row: Answer content (images)
      return shuffledChoices[col]?.text ?? "";
    } else {
      // Second row: Letter and checkbox combined
      const letter = String.fromCharCode(97 + col); // a, b, c, d
      return `${letter}) ${CHECKBOX_PLACEHOLDER}`;
    }
  };

  // Create column widths array with the right number of columns
  const columnWidths = Array(numColumns).fill(COLUMN_WIDTHS.imageColumn);
  const columnAlignments = Array(numColumns).fill("CENTER");

  elements.push(
    createTableElement({
      insertIndex,
      rows: 2, // 2 rows: images, then letters+checkboxes
      columns: numColumns,
      cellContent,
      columnWidths,
      columnAlignments,
    }),
  );

  return elements;
}

/**
 * Detect if a table is an image quiz table based on its structure
 * Image quiz tables have all columns with 130pt fixed width
 */
export function isImageQuizTable(table: docs_v1.Schema$Table): boolean {
  const properties = table.tableStyle?.tableColumnProperties;
  if (!properties) return false;
  return !!(
    properties.length &&
    properties.every(
      (colProps) =>
        colProps.widthType === "FIXED_WIDTH" &&
        colProps.width?.magnitude === 130 &&
        colProps.width?.unit === "PT",
    )
  );
}

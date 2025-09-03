/**
 * Matching pairs question generator
 */
import invariant from "tiny-invariant";

import {
  addInstruction,
  processBlankPlaceholders,
} from "../../../../../quiz-utils/formatting";
import { shuffleMatchItems } from "../../../../../quiz-utils/shuffle";
import { CHECKBOX_PLACEHOLDER, COLUMN_WIDTHS } from "../constants";
import { createTableElement, createTextElement } from "../elements";
import type { QuizElement } from "../types";

/**
 * Generate elements for a matching pairs question table
 * Layout: 5 columns (letter | left text | spacer | checkbox | right text)
 */
export function generateMatchingPairsTable(
  insertIndex: number,
  question: string,
  questionNumber: number,
  leftItems: string[],
  rightItems: string[],
): QuizElement[] {
  const elements: QuizElement[] = [];

  // Question text element with properly formatted instruction
  const instruction = "Write the matching letter in each box.";
  const questionWithBlanks = processBlankPlaceholders(question);
  const formattedQuestion = addInstruction(questionWithBlanks, instruction);
  elements.push(
    createTextElement(insertIndex, `${questionNumber}. ${formattedQuestion}`),
  );

  // Validate that left and right items match in count
  invariant(
    leftItems.length === rightItems.length,
    `Matching pairs question must have equal left and right items. Got ${leftItems.length} left, ${rightItems.length} right`,
  );

  // Shuffle right items deterministically and calculate table dimensions
  const shuffledRightItems = shuffleMatchItems(rightItems);
  const rows = leftItems.length;

  // Matching table element
  const cellContent = (row: number, col: number): string => {
    // Column 0: Letter labels (a), b), c), etc.)
    if (col === 0 && row < leftItems.length) {
      return `${String.fromCharCode(97 + row)})`;
    }
    // Column 1: Left side text content
    if (col === 1 && row < leftItems.length) {
      return leftItems[row] ?? "";
    }
    // Column 2: Spacer column
    if (col === 2) return "";
    // Column 3: Answer checkboxes
    if (col === 3 && row < shuffledRightItems.length) {
      return CHECKBOX_PLACEHOLDER;
    }
    // Column 4: Right side text content
    if (col === 4 && row < shuffledRightItems.length) {
      return shuffledRightItems[row]?.text ?? "";
    }
    return "";
  };

  elements.push(
    createTableElement(insertIndex, rows, 5, cellContent, [
      COLUMN_WIDTHS.letter,
      COLUMN_WIDTHS.textNarrow,
      COLUMN_WIDTHS.spacer,
      COLUMN_WIDTHS.checkbox,
      COLUMN_WIDTHS.auto,
    ]),
  );

  return elements;
}

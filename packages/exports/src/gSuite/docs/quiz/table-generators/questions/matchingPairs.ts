/**
 * Matching pairs question generator
 */
import { addInstruction } from "../../../../../quiz-utils/formatting";
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
  const formattedQuestion = addInstruction(question, instruction);
  elements.push(
    createTextElement(insertIndex, `${questionNumber}. ${formattedQuestion}`),
  );

  // Shuffle right items deterministically and calculate table dimensions
  const shuffledRightItems = shuffleMatchItems(rightItems);
  const rows = Math.max(leftItems.length, shuffledRightItems.length);

  // Matching table element
  const cellContent = (row: number, col: number): string => {
    if (col === 0 && row < leftItems.length) {
      return `${String.fromCharCode(97 + row)})`;
    }
    if (col === 1 && row < leftItems.length) {
      return leftItems[row] ?? "";
    }
    if (col === 2) return ""; // Spacer column
    if (col === 3 && row < shuffledRightItems.length) {
      return CHECKBOX_PLACEHOLDER;
    }
    if (col === 4 && row < shuffledRightItems.length) {
      return shuffledRightItems[row]?.text ?? "";
    }
    return "";
  };

  elements.push(
    createTableElement(insertIndex, rows, 5, cellContent, [
      COLUMN_WIDTHS.letter,
      COLUMN_WIDTHS.auto,
      COLUMN_WIDTHS.spacer,
      COLUMN_WIDTHS.checkbox,
      COLUMN_WIDTHS.auto,
    ]),
  );

  return elements;
}

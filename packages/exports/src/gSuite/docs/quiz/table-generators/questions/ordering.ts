/**
 * Ordering question generator
 */
import { addInstruction } from "../../../../../quiz-utils/formatting";
import { shuffleOrderItems } from "../../../../../quiz-utils/shuffle";
import { COLUMN_WIDTHS } from "../constants";
import { createTableElement, createTextElement } from "../elements";
import type { QuizElement } from "../types";

/**
 * Generate elements for an ordering question table
 * Layout: 2 columns (checkbox | item text)
 */
export function generateOrderingTable(
  insertIndex: number,
  question: string,
  questionNumber: number,
  items: string[],
): QuizElement[] {
  const elements: QuizElement[] = [];

  // Shuffle items deterministically
  const shuffledItems = shuffleOrderItems(items);

  // Question text element with properly formatted instruction
  const instruction = "Write the correct number in each box.";
  const formattedQuestion = addInstruction(question, instruction);
  elements.push(
    createTextElement(insertIndex, `${questionNumber}. ${formattedQuestion}`),
  );

  // Items table element
  const cellContent = (row: number, col: number): string => {
    if (col === 0) return "☐";
    return shuffledItems[row]?.text ?? "";
  };

  elements.push(
    createTableElement(insertIndex, shuffledItems.length, 2, cellContent, [
      COLUMN_WIDTHS.checkbox,
      COLUMN_WIDTHS.textFull,
    ]),
  );

  return elements;
}

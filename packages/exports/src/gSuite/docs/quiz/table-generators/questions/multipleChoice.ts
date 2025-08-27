/**
 * Multiple choice question generator
 */
import { addInstruction } from "../../../../../quiz-utils/formatting";
import { shuffleMultipleChoiceAnswers } from "../../../../../quiz-utils/shuffle";
import { CHECKBOX_PLACEHOLDER, COLUMN_WIDTHS } from "../constants";
import { createTableElement, createTextElement } from "../elements";
import type { QuizElement } from "../types";

/**
 * Generate elements for a multiple choice question table
 * Layout: 3 columns (checkbox | letter | answer text)
 */
export function generateMultipleChoiceTable(
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
  const formattedQuestion = addInstruction(question, instruction);
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
    createTableElement(insertIndex, shuffledChoices.length, 3, cellContent, [
      COLUMN_WIDTHS.checkbox,
      COLUMN_WIDTHS.letter,
      COLUMN_WIDTHS.auto,
    ]),
  );

  return elements;
}

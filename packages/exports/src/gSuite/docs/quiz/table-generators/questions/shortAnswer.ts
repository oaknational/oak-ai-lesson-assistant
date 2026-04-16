/**
 * Short answer question generator
 */
import {
  addInstruction,
  hasBlankPlaceholders,
  processBlankPlaceholders,
} from "../../../../../quiz-utils/formatting";
import { createTextElement } from "../elements";
import type { QuizElement } from "../types";

/**
 * Generate elements for a short answer question (no table needed)
 * Uses repeated ▁ character for answer line
 */
export function generateShortAnswerQuestion(
  insertIndex: number,
  question: string,
  questionNumber: number,
): QuizElement[] {
  const blankLine = "▁".repeat(10);
  const instruction = "Fill in the blank.";
  const questionWithBlanks = processBlankPlaceholders(question);
  const formattedQuestion = addInstruction(questionWithBlanks, instruction);

  // If question already contains inline blanks, don't add a separate answer line
  if (hasBlankPlaceholders(question)) {
    return [
      createTextElement(
        insertIndex,
        `${questionNumber}. ${formattedQuestion}\n`,
      ),
    ];
  }

  // If no inline blanks, add a separate blank line for the answer
  return [
    createTextElement(
      insertIndex,
      `${questionNumber}. ${formattedQuestion}\n\n${blankLine}\n`,
    ),
  ];
}

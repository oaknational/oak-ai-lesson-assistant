/**
 * Short answer question generator
 */
import { addInstruction } from "../../../../../quiz-utils/formatting";
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
  isInline: boolean = false,
): QuizElement[] {
  const answerLine = "▁".repeat(10);
  const instruction = "Fill in the blank.";

  if (isInline) {
    const placeholderPattern = /____+/;
    const textWithLine = question.replace(placeholderPattern, answerLine);
    const formattedQuestion = addInstruction(textWithLine, instruction);
    return [
      createTextElement(
        insertIndex,
        `${questionNumber}. ${formattedQuestion}\n`,
      ),
    ];
  } else {
    const formattedQuestion = addInstruction(question, instruction);
    return [
      createTextElement(
        insertIndex,
        `${questionNumber}. ${formattedQuestion}\n\n${answerLine}\n`,
      ),
    ];
  }
}

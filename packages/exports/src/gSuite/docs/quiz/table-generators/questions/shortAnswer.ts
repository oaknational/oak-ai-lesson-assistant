/**
 * Short answer question generator
 */
import { addInstruction } from "../../../../../quiz-utils/formatting";
import { createTextElement } from "../elements";
import type { QuizElement } from "../types";

// Blank patterns that we support
// NOTE: Don't use /g flags as they are stateful when tested multiple times
const BLANK_PATTERNS = {
  CURLY_BRACES: /\{\{ ?\}\}/,
  UNDERSCORES: /_{3,}/,
} as const;

export const hasBlankSpaces = (text: string): boolean => {
  return (
    BLANK_PATTERNS.CURLY_BRACES.test(text) ||
    BLANK_PATTERNS.UNDERSCORES.test(text)
  );
};

/**
 * Generate elements for a short answer question (no table needed)
 * Uses repeated ▁ character for answer line
 */
export function generateShortAnswerQuestion(
  insertIndex: number,
  question: string,
  questionNumber: number,
): QuizElement[] {
  const answerLine = "▁".repeat(10);
  const instruction = "Fill in the blank.";
  const isInline = hasBlankSpaces(question);

  if (isInline) {
    const textWithLine = question
      .replace(BLANK_PATTERNS.CURLY_BRACES, answerLine)
      .replace(BLANK_PATTERNS.UNDERSCORES, answerLine);
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

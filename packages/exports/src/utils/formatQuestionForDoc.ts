import {
  hasBlankPlaceholders,
  processBlankPlaceholders,
} from "../quiz-utils/formatting";
import {
  type ShuffledChoice,
  type ShuffledMatchItem,
  type ShuffledOrderItem,
  shuffleMatchItems,
  shuffleMultipleChoiceAnswers,
  shuffleOrderItems,
} from "../quiz-utils/shuffle";
import type { QuizQAD, QuizQuestion } from "../schema/input.schema";

function createQuestionHeader(number: number, text: string): string {
  const processedQuestion = processBlankPlaceholders(text);
  return `${number}. ${processedQuestion}`;
}

function formatChoice(choice: ShuffledChoice, index: number): string {
  const letter = String.fromCharCode(97 + index);
  const tick = choice.isCorrect ? " ✓" : "";
  return `  ${letter}) ${choice.text}${tick}`;
}

function formatMultipleChoice(choices: ShuffledChoice[]): string {
  return choices.map(formatChoice).join("\n");
}

function formatShortAnswer(
  questionText: string,
  hasInlineBlanks: boolean,
): string {
  if (hasInlineBlanks) {
    return "";
  }

  const blankLine = "▁".repeat(10);
  return `\n  ${blankLine}`;
}

function formatMatchPair(
  left: string,
  right: ShuffledMatchItem | undefined,
): string {
  const rightFormatted = right
    ? `${right.label.toUpperCase()}. ${right.text}`
    : "";
  return `  ${left.padEnd(18)} ${rightFormatted}`;
}

function formatMatchPairs(
  leftItems: string[],
  rightItems: ShuffledMatchItem[],
): string {
  const maxLength = Math.max(leftItems.length, rightItems.length);

  const pairedLines = Array.from({ length: maxLength }, (_, i) =>
    formatMatchPair(leftItems[i] ?? "", rightItems[i]),
  );

  return `\n${pairedLines.join("\n")}`;
}

function formatOrderItems(items: ShuffledOrderItem[]): string {
  const formattedItems = items.map((item) => `  • ${item.text}`);
  return `\n${formattedItems.join("\n")}`;
}

/**
 * Format a question for lesson plan documents
 * Each question type is formatted differently to display properly in the table layout
 */
export function formatQuestionForDoc(
  question: QuizQuestion,
  questionNumber: number,
): string {
  const questionHeader = createQuestionHeader(
    questionNumber,
    question.question,
  );

  switch (question.questionType) {
    case "multiple-choice": {
      const shuffledChoices = shuffleMultipleChoiceAnswers(
        question.answers,
        question.distractors,
      );
      const answersSection = formatMultipleChoice(shuffledChoices);
      return `${questionHeader}\n${answersSection}`;
    }

    case "short-answer": {
      const hasInlineBlanks = hasBlankPlaceholders(question.question);
      const answerSection = formatShortAnswer(questionHeader, hasInlineBlanks);
      return questionHeader + answerSection;
    }

    case "match": {
      if (question.pairs.length === 0) {
        return `${questionHeader}\n(No matching pairs provided)`;
      }

      const leftItems = question.pairs.map(
        (pair, index) => `${index + 1}. ${pair.left}`,
      );
      const rightTexts = question.pairs.map((pair) => pair.right);
      const shuffledRightItems = shuffleMatchItems(rightTexts);

      const pairsSection = formatMatchPairs(leftItems, shuffledRightItems);
      return questionHeader + pairsSection;
    }

    case "order": {
      if (question.items.length === 0) {
        return `${questionHeader}\n(No items provided)`;
      }

      const shuffledItems = shuffleOrderItems(question.items);
      const itemsSection = formatOrderItems(shuffledItems);
      return questionHeader + itemsSection;
    }

    default: {
      const _exhaustive: never = question;
      return `${questionHeader}\n(Unsupported question type)`;
    }
  }
}

/**
 * Format a legacy QuizQAD question (multiple-choice only) for lesson plan documents
 */
export function formatLegacyQuestionForDoc(
  question: QuizQAD,
  questionNumber: number,
): string {
  const questionHeader = createQuestionHeader(
    questionNumber,
    question.question,
  );
  const shuffledChoices = shuffleMultipleChoiceAnswers(
    question.answers,
    question.distractors,
  );
  const answersSection = formatMultipleChoice(shuffledChoices);
  return `${questionHeader}\n${answersSection}`;
}

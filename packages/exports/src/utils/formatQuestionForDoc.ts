import type { QuizQAD, QuizV2Question } from "../schema/input.schema";
import { 
  shuffleMultipleChoiceAnswers, 
  shuffleOrderItems, 
  shuffleMatchItems 
} from "../quiz-utils/shuffle";
import { 
  hasBlankPlaceholders, 
  processBlankPlaceholders 
} from "../quiz-utils/formatting";

/**
 * Format a question for lesson plan documents
 * Each question type is formatted differently to display properly in the table layout
 */
export function formatQuestionForDoc(
  question: QuizV2Question,
  questionNumber: number,
): string {
  const processedQuestion = processBlankPlaceholders(question.question);
  const questionText = `${questionNumber}. ${processedQuestion}`;

  switch (question.questionType) {
    case "multiple-choice": {
      const shuffledChoices = shuffleMultipleChoiceAnswers(
        question.answers,
        question.distractors,
      );
      
      const formattedAnswers = shuffledChoices
        .map((choice, index) => {
          const letter = String.fromCharCode(97 + index); // a, b, c, d...
          const tick = choice.isCorrect ? " ✓" : "";
          return `  ${letter}) ${choice.text}${tick}`;
        })
        .join("\n");

      return `${questionText}\n${formattedAnswers}`;
    }

    case "short-answer": {
      // If question already contains inline blanks, don't add separate answer line
      if (hasBlankPlaceholders(question.question)) {
        return questionText;
      }
      
      // If no inline blanks, add a separate answer line
      const blankLine = "▁".repeat(10);
      return `${questionText}\n  ${blankLine}`;
    }

    case "match": {
      if (question.pairs.length === 0) {
        return `${questionText}\n(No matching pairs provided)`;
      }

      const leftItems = question.pairs.map(
        (pair, index) => `${index + 1}. ${pair.left}`,
      );
      
      const rightTexts = question.pairs.map((pair) => pair.right);
      const shuffledRightItems = shuffleMatchItems(rightTexts);

      // Create a two-column layout
      const maxLines = Math.max(leftItems.length, shuffledRightItems.length);
      const pairedLines = [];
      
      for (let i = 0; i < maxLines; i++) {
        const left = leftItems[i] ?? "";
        const right = shuffledRightItems[i] 
          ? `${shuffledRightItems[i].label.toUpperCase()}. ${shuffledRightItems[i].text}`
          : "";
        pairedLines.push(`  ${left.padEnd(18)} ${right}`);
      }

      return `${questionText}\n${pairedLines.join("\n")}`;
    }

    case "order": {
      if (question.items.length === 0) {
        return `${questionText}\n(No items provided)`;
      }

      const shuffledItems = shuffleOrderItems(question.items);
      
      const formattedItems = shuffledItems
        .map((item) => `  • ${item.text}`)
        .join("\n");

      return `${questionText}\n${formattedItems}`;
    }

    default: {
      // TypeScript exhaustiveness check
      const _exhaustive: never = question;
      return `${questionText}\n(Unsupported question type)`;
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
  const processedQuestion = processBlankPlaceholders(question.question);
  const questionText = `${questionNumber}. ${processedQuestion}`;
  
  const shuffledChoices = shuffleMultipleChoiceAnswers(
    question.answers,
    question.distractors,
  );
  
  const formattedAnswers = shuffledChoices
    .map((choice, index) => {
      const letter = String.fromCharCode(97 + index); // a, b, c, d...
      const tick = choice.isCorrect ? " ✓" : "";
      return `  ${letter}) ${choice.text}${tick}`;
    })
    .join("\n");

  return `${questionText}\n${formattedAnswers}`;
}
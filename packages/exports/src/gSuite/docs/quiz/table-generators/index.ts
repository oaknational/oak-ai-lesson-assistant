/**
 * Main exports and orchestration for quiz table generation
 */
import type { docs_v1 } from "@googleapis/docs";

import type { QuizV2Question } from "../../../../schema/input.schema";
import { createSpacerElement } from "./elements";
import { generateMatchingPairsTable } from "./questions/matchingPairs";
import { generateMultipleChoiceTable } from "./questions/multipleChoice";
import { generateOrderingTable } from "./questions/ordering";
import { generateShortAnswerQuestion } from "./questions/shortAnswer";
import type { QuizElement } from "./types";

// Re-export everything for convenience
export * from "./types";
export * from "./constants";
export * from "./helpers";
export * from "./elements";
export * from "./questions/multipleChoice";
export * from "./questions/matchingPairs";
export * from "./questions/ordering";
export * from "./questions/shortAnswer";

/**
 * Get elements for a single question based on its type
 */
function getQuestionElements(
  insertIndex: number,
  questionNumber: number,
  q: QuizV2Question,
): QuizElement[] {
  switch (q.questionType) {
    case "multiple-choice":
      return generateMultipleChoiceTable(
        insertIndex,
        q.question,
        questionNumber,
        q.answers,
        q.answers.length,
        q.distractors,
      );

    case "match": {
      const leftItems = q.pairs.map((p) => p.left);
      const rightItems = q.pairs.map((p) => p.right);
      return generateMatchingPairsTable(
        insertIndex,
        q.question,
        questionNumber,
        leftItems,
        rightItems,
      );
    }

    case "order":
      return generateOrderingTable(
        insertIndex,
        q.question,
        questionNumber,
        q.items,
      );

    case "short-answer": {
      // Check if question contains inline placeholder
      const isInline = q.question.includes("{{}}");
      return generateShortAnswerQuestion(
        insertIndex,
        q.question,
        questionNumber,
        isInline,
      );
    }
  }
}

/**
 * Generate all quiz elements using individual generator functions
 * Processes questions in forward order, then reverses for execution
 */
export function generateAllQuizElements(
  insertIndex: number,
  questions: QuizV2Question[],
): docs_v1.Schema$Request[] {
  const allElements: QuizElement[] = [];

  // Generate elements for each question in forward order
  questions.forEach((q, index) => {
    const questionNumber = index + 1;

    // Add spacing before each question (except first)
    if (index > 0) {
      allElements.push(createSpacerElement(insertIndex));
    }

    // Get question-specific elements
    const questionElements = getQuestionElements(
      insertIndex,
      questionNumber,
      q,
    );
    allElements.push(...questionElements);
  });

  // Reverse all elements for backwards insertion
  allElements.reverse();

  // Flatten all requests from reversed elements
  return allElements.flatMap((element) => element.requests);
}

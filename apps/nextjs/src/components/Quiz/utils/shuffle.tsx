import type { QuizV2ContentArray } from "@oakai/aila/src/protocol/schemas";

/**
 * Simple hash function for deterministic randomization
 * Uses built-in JavaScript operations for fast, consistent hashing
 */
function simpleHash(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export interface ShuffledChoice {
  content: QuizV2ContentArray;
  isCorrect: boolean;
  sortKey: number;
}

/**
 * Shuffle multiple choice answers and distractors deterministically
 * Uses content-based hashing to ensure same content always produces same order
 */
export function shuffleMultipleChoiceAnswers(
  answers: QuizV2ContentArray[],
  distractors: QuizV2ContentArray[]
): ShuffledChoice[] {
  const allChoices: ShuffledChoice[] = [
    ...answers.map(answer => ({
      content: answer,
      isCorrect: true,
      sortKey: simpleHash(JSON.stringify(answer))
    })),
    ...distractors.map(distractor => ({
      content: distractor,
      isCorrect: false,
      sortKey: simpleHash(JSON.stringify(distractor))
    }))
  ];
  
  return allChoices.sort((a, b) => a.sortKey - b.sortKey);
}

export interface ShuffledMatchingPairs {
  leftItems: QuizV2ContentArray[];
  rightItems: QuizV2ContentArray[];
}

/**
 * Shuffle matching question pairs deterministically
 * Keeps left items in original order, shuffles right items to break patterns
 */
export function shuffleMatchingPairs(
  pairs: Array<{ left: QuizV2ContentArray; right: QuizV2ContentArray }>
): ShuffledMatchingPairs {
  // Keep left items in original order for better usability
  const leftItems = pairs.map(pair => pair.left);
    
  // Shuffle right items to break up matching patterns
  const rightItems = pairs
    .map(pair => ({
      item: pair.right,
      sortKey: simpleHash(JSON.stringify(pair.right))
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(x => x.item);
    
  return { leftItems, rightItems };
}

/**
 * Shuffle order question items deterministically
 * Note: This shuffles the display order, not the correct solution order
 */
export function shuffleOrderItems(items: QuizV2ContentArray[]): QuizV2ContentArray[] {
  return items
    .map(item => ({
      item,
      sortKey: simpleHash(JSON.stringify(item))
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(x => x.item);
}
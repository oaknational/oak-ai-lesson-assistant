/**
 * Deterministic shuffling utilities for quiz questions
 * Uses hash-based approach to ensure consistent ordering
 */

/**
 * Create a simple hash from a string for deterministic shuffling
 */
function simpleHash(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export interface ShuffledChoice {
  text: string;
  isCorrect: boolean;
}

/**
 * Detect if all choices follow the same pattern with only A/B/C/D letters differing
 */
function detectLetterAnswerPattern(choices: string[]): boolean {
  if (choices.length < 2) return false;

  // Strip all standalone A-D letters and compare the remaining text
  const strippedChoices = choices.map((choice) =>
    choice.replace(/\b[a-dA-D]\b/g, ""),
  );
  const baseChoice = strippedChoices[0];

  return strippedChoices.every((choice) => choice === baseChoice);
}

/**
 * Shuffle multiple choice answers and distractors deterministically
 */
export function shuffleMultipleChoiceAnswers(
  answers: string[],
  distractors: string[],
): ShuffledChoice[] {
  const allChoicesText = [...answers, ...distractors];

  // Check if all choices follow a letter answer pattern (Line A, Line B, etc.)
  const hasLetterAnswerPattern = detectLetterAnswerPattern(allChoicesText);

  const allChoices = [
    ...answers.map((answer) => ({
      text: answer,
      isCorrect: true,
      sortKey: simpleHash(answer),
    })),
    ...distractors.map((distractor) => ({
      text: distractor,
      isCorrect: false,
      sortKey: simpleHash(distractor),
    })),
  ];

  if (hasLetterAnswerPattern) {
    // Sort alphabetically when letter answer pattern is detected
    return allChoices
      .sort((a, b) => a.text.localeCompare(b.text))
      .map((choice) => ({
        text: choice.text,
        isCorrect: choice.isCorrect,
      }));
  }

  // Default hash-based deterministic shuffling
  return allChoices
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((choice) => ({
      text: choice.text,
      isCorrect: choice.isCorrect,
    }));
}

export interface ShuffledOrderItem {
  text: string;
  correctIndex: number;
}

/**
 * Shuffle items for ordering questions deterministically
 * Returns items with their original 1-based index
 */
export function shuffleOrderItems(items: string[]): ShuffledOrderItem[] {
  const itemsWithKeys = items.map((item, index) => ({
    text: item,
    correctIndex: index + 1, // 1-based index for display
    sortKey: simpleHash(item),
  }));

  return itemsWithKeys
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((item) => ({
      text: item.text,
      correctIndex: item.correctIndex,
    }));
}

export interface ShuffledMatchItem {
  text: string;
  label: string;
}

/**
 * Shuffle match question right-side items deterministically
 * Assigns lowercase letters as labels
 */
export function shuffleMatchItems(items: string[]): ShuffledMatchItem[] {
  const itemsWithLabels = items.map((item, index) => ({
    text: item,
    label: String.fromCharCode(97 + index), // a, b, c, etc.
    sortKey: simpleHash(item),
  }));

  return itemsWithLabels
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((item) => ({
      text: item.text,
      label: item.label,
    }));
}

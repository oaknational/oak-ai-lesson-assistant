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
 * Shuffle multiple choice answers and distractors deterministically
 */
export function shuffleMultipleChoiceAnswers(
  answers: string[],
  distractors: string[],
): ShuffledChoice[] {
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

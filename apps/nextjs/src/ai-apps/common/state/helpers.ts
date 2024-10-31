import type { GenerationPart } from "@oakai/core/src/types";

/**
 * Apply the `updater` function to the item
 * at `index`, returning the updated list
 */
export function updateAtIndex<T>(
  list: T[],
  index: number,
  updater: (question: T) => T,
): T[] {
  return list.map((elem, i) => (i === index ? updater(elem) : elem));
}

export function removeAtIndex<T>(index: number, items: T[]): T[] {
  return items.filter((q, i) => i !== index);
}

export function getGenerationPartValue<Value>(
  generationPart: GenerationPart<Value>,
): Value {
  return generationPart.value;
}

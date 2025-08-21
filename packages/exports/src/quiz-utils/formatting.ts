/**
 * Question formatting utilities
 * Ensures consistency between web display and exported documents
 */

/**
 * Ensures text ends with proper punctuation
 * Preserves markdown images at the end
 */
export function ensureEndsWithPeriod(text: string): string {
  const trimmed = text.trim();

  // Check if it ends with a markdown image
  if (trimmed.match(/!\[.*?\]\(.*?\)$/)) {
    return trimmed;
  }

  // Check if it already ends with punctuation
  if (trimmed.match(/[.!?:]$/)) {
    return trimmed;
  }

  return trimmed + ".";
}

/**
 * Adds an instruction to a question, ensuring proper punctuation
 */
export function addInstruction(question: string, instruction: string): string {
  return `${ensureEndsWithPeriod(question)} ${instruction}`;
}

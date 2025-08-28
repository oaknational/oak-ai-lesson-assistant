/**
 * Question formatting utilities
 * Ensures consistency between web display and exported documents
 */

// Blank patterns that we support
// NOTE: Don't use /g flags as they are stateful when tested multiple times
const BLANK_PATTERNS = {
  CURLY_BRACES: /\{\{ ?\}\}/,
  UNDERSCORES: /_{3,}/,
} as const;

// Length of the blank line placeholder (repeated underline characters)
const BLANK_LINE_LENGTH = 10;

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

/**
 * Checks if text contains blank placeholders
 */
export function hasBlankPlaceholders(text: string): boolean {
  return (
    BLANK_PATTERNS.CURLY_BRACES.test(text) ||
    BLANK_PATTERNS.UNDERSCORES.test(text)
  );
}

/**
 * Processes blank placeholders in text, converting them to underlined spaces
 * Uses U+2581 LOWER ONE EIGHTH BLOCK character repeated multiple times
 */
export function processBlankPlaceholders(text: string): string {
  const blankLine = "▁".repeat(BLANK_LINE_LENGTH); // U+2581 LOWER ONE EIGHTH BLOCK

  return text
    .replace(BLANK_PATTERNS.CURLY_BRACES, blankLine)
    .replace(BLANK_PATTERNS.UNDERSCORES, blankLine);
}

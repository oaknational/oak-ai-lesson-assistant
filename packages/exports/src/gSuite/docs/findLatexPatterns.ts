import { aiLogger } from "@oakai/logger";

const log = aiLogger("exports");

export interface LatexPattern {
  latex: string;
  fullMatch: string;
  startIndex: number;
  endIndex: number;
  type: "inline" | "display";
}

/**
 * Finds LaTeX patterns in text content
 * Supports multiple delimiter styles:
 * - Inline: $...$ and \(...\)
 * - Display: $$...$$ and \[...\]
 */
export function findLatexPatterns(text: string): LatexPattern[] {
  const patterns: LatexPattern[] = [];

  // Define regex patterns for different LaTeX delimiters
  const delimiters = [
    // Inline math with single dollar signs (must not be preceded or followed by $)
    { regex: /(?<!\$)\$(?!\$)([^$]+)\$(?!\$)/g, type: "inline" as const },
    // Display math with double dollar signs
    { regex: /\$\$([^$]+)\$\$/g, type: "display" as const },
    // Inline math with \(...\)
    { regex: /\\\((.+?)\\\)/g, type: "inline" as const },
    // Display math with \[...\]
    { regex: /\\\[(.+?)\\\]/gs, type: "display" as const },
  ];

  // Process each delimiter pattern
  for (const { regex, type } of delimiters) {
    let match;
    regex.lastIndex = 0; // Reset regex state

    while ((match = regex.exec(text)) !== null) {
      const fullMatch = match[0];
      const latex = match[1];
      const startIndex = match.index;
      const endIndex = startIndex + fullMatch.length;

      // Check if this pattern overlaps with any existing pattern
      const overlaps = patterns.some(
        (p) =>
          (startIndex >= p.startIndex && startIndex < p.endIndex) ||
          (endIndex > p.startIndex && endIndex <= p.endIndex) ||
          (startIndex <= p.startIndex && endIndex >= p.endIndex),
      );

      if (!overlaps && latex && latex.trim()) {
        patterns.push({
          latex: latex.trim(),
          fullMatch,
          startIndex,
          endIndex,
          type,
        });
      }
    }
  }

  // Sort patterns by startIndex to maintain document order
  patterns.sort((a, b) => a.startIndex - b.startIndex);

  log.info(`Found ${patterns.length} LaTeX patterns in text`);

  return patterns;
}

/**
 * Generates a hash for a LaTeX expression to use for caching
 * Uses a simple hash function suitable for cache keys
 */
export function generateLatexHash(latex: string): string {
  let hash = 0;
  for (let i = 0; i < latex.length; i++) {
    const char = latex.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

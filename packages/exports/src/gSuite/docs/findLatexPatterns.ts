import { createHash } from "crypto";
import invariant from "tiny-invariant";

export interface LatexPattern {
  latex: string;
  type: "inline" | "display";
  startIndex: number;
  endIndex: number;
  hash: string;
}

/**
 * Generate a hash for a LaTeX expression to use as a unique identifier
 */
export function generateLatexHash(latex: string): string {
  return createHash("md5").update(latex).digest("hex").substring(0, 8);
}

/**
 * Find all LaTeX patterns in a text string
 * Based on Oak's usage: $$ is used for inline math (configured in MathJaxContext.tsx)
 */
export function findLatexPatterns(text: string): LatexPattern[] {
  const patterns: LatexPattern[] = [];

  // Oak uses $$ for inline math (see MathJaxContext.tsx configuration)
  // Pattern matches $$ ... $$ with optional spaces inside
  const regex = /\$\$\s*([^$]+?)\s*\$\$/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    invariant(match[1], "Regex match should have capture group");
    const latex = match[1].trim(); // Trim whitespace from the LaTeX content
    patterns.push({
      latex,
      type: "inline", // Always inline as per Oak's configuration
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      hash: generateLatexHash(latex),
    });
  }

  // Sort by startIndex to process in order
  patterns.sort((a, b) => a.startIndex - b.startIndex);

  return patterns;
}

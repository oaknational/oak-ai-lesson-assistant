import type { ParsedCellId } from "./types";

/**
 * Parses a composite cell ID back into its components
 *
 * @param cellId - Composite cell ID in format: {tableId}_r{row}c{col}
 * @returns Parsed components or null if the format is invalid
 *
 * @example
 * ```typescript
 * const parsed = parseCellId('p42_i1629_r1c2');
 * // Returns: { tableId: 'p42_i1629', row: 1, col: 2 }
 *
 * const invalid = parseCellId('invalid');
 * // Returns: null
 * ```
 */
export function parseCellId(cellId: string): ParsedCellId | null {
  // Pattern: {tableId}_r{row}c{col}
  // The tableId can contain underscores, so we match from the end
  const match = cellId.match(/^(.+)_r(\d+)c(\d+)$/);

  if (!match || !match[1] || !match[2] || !match[3]) {
    return null;
  }

  return {
    tableId: match[1],
    row: parseInt(match[2], 10),
    col: parseInt(match[3], 10),
  };
}

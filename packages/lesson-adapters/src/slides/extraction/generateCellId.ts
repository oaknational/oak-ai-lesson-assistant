/**
 * Generates a composite cell ID for LLM reference
 *
 * The format allows LLMs to reference specific table cells in their responses,
 * and we can parse these IDs back to make Google Slides API calls.
 *
 * @param tableId - The Google Slides objectId of the table
 * @param row - 0-based row index
 * @param col - 0-based column index
 * @returns Composite ID in format: {tableId}_r{row}c{col}
 *
 * @example
 * ```typescript
 * const cellId = generateCellId('p42_i1629', 1, 2);
 * // Returns: 'p42_i1629_r1c2'
 * ```
 */
export function generateCellId(
  tableId: string,
  row: number,
  col: number,
): string {
  return `${tableId}_r${row}c${col}`;
}

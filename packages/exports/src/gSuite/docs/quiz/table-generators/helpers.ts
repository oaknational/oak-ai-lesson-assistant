/**
 * Helper functions for quiz table generation
 */

/**
 * Convert pixels to points (1px = 0.75pt)
 */
export function pxToPt(pixels: number): number {
  return pixels * 0.75;
}

/**
 * Calculate cell insertion indices for a table
 * Formula verified: first cell at tableStart + 4, then +2 per cell, +1 per row
 */
export function calculateCellIndices(
  tableStartIndex: number,
  rows: number,
  columns: number,
): number[] {
  const indices: number[] = [];
  let idx = tableStartIndex + 4; // First cell's insertion point

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      indices.push(idx);
      idx += 2; // Each cell takes 2 indices
    }
    idx += 1; // Row boundary adds 1
  }

  return indices;
}

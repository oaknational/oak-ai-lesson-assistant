/**
 * Helper functions for quiz table generation
 */

/**
 * Convert pixels to points (1px = 0.75pt)
 */
export function pxToPt(pixels: number): number {
  return pixels * 0.75;
}

// Constants for table cell index calculations
const FIRST_CELL_OFFSET = 4; // Offset from table start to first cell
const CELL_SIZE = 2; // Number of indices each cell occupies
const ROW_BOUNDARY = 1; // Additional index at end of each row

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
  let idx = tableStartIndex + FIRST_CELL_OFFSET;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      indices.push(idx);
      idx += CELL_SIZE;
    }
    idx += ROW_BOUNDARY;
  }

  return indices;
}

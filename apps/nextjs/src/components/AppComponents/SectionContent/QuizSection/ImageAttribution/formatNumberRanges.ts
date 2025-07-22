/**
 * Converts an array of numbers into a range string with Q prefix
 * e.g., [1,2,4,5,6] => "Q1-Q2,Q4-Q6"
 * @param numbers Array of numbers to convert
 * @returns String representation of ranges with Q prefix
 */
export function formatNumberRanges(numbers: number[]): string {
  if (numbers.length === 0) return "";

  // Sort and deduplicate
  const sorted = [...new Set(numbers)].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0]!;
  let end = sorted[0]!;

  for (let i = 1; i <= sorted.length; i++) {
    if (i < sorted.length && sorted[i]! === end + 1) {
      end = sorted[i]!;
    } else {
      if (start === end) {
        ranges.push(`Q${start}`);
      } else {
        ranges.push(`Q${start}-Q${end}`);
      }

      if (i < sorted.length) {
        start = sorted[i]!;
        end = sorted[i]!;
      }
    }
  }

  return ranges.join(",");
}

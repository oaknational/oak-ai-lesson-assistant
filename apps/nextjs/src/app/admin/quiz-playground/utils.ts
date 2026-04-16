/**
 * Format milliseconds as seconds with one decimal place.
 * Example: 1234 -> "1.2s"
 */
export function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(1) + "s";
}

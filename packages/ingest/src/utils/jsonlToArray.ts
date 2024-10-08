export function jsonlToArray(jsonl: string) {
  return jsonl
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => JSON.parse(line));
}

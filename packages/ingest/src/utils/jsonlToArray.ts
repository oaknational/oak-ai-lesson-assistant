export function jsonlToArray(jsonl: string): unknown[] {
  return (
    jsonl
      .split("\n")
      .filter((line) => line.trim() !== "")
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      .map((line) => JSON.parse(line))
  );
}

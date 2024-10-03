import fs from "node:fs";
import readline from "node:readline";

export function jsonlToArray<T>({
  filePath,
  transformLine,
}: {
  filePath: string;
  transformLine: (line: string) => T;
}) {
  return new Promise<T[]>((resolve, reject) => {
    const array: T[] = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });
    rl.on("line", (line) => {
      const transformedLine = transformLine(line);
      array.push(transformedLine);
    });
    rl.on("close", () => {
      resolve(array);
    });
    rl.on("error", reject);
  });
}

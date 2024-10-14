import fs from "node:fs";
import readline from "node:readline";

export function getCustomIdsFromJsonlFile({
  filePath,
}: {
  filePath: string;
}): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const ids: string[] = [];
    const fileStream = fs.createReadStream(filePath, {
      encoding: "utf-8",
    });
    const rl = readline.createInterface({
      input: fileStream,
    });
    rl.on("line", (line) => {
      try {
        const customId = JSON.parse(line).customId;
        ids.push(customId);
      } catch (cause) {
        const error = new Error("Failed to parse customId", { cause });
        reject(error);
      }
    });
    rl.on("close", () => {
      resolve(ids);
    });
    rl.on("error", reject);
  });
}

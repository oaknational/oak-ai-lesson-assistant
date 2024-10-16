import fs from "node:fs";
import readline from "node:readline";

import { IngestError } from "../IngestError";

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
      if (!line) {
        return;
      }
      try {
        const customId = JSON.parse(line).custom_id;
        if (typeof customId !== "string") {
          throw new IngestError("custom_id is not a string");
        }
        ids.push(customId);
      } catch (cause) {
        const error = new IngestError("Failed to parse customId", {
          cause,
          errorDetail: line,
        });
        reject(error);
      }
    });
    rl.on("close", () => {
      resolve(ids);
    });
    rl.on("error", reject);
  });
}

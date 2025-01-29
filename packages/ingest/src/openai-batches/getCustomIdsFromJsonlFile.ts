import fs from "node:fs";
import readline from "node:readline";
import { z } from "zod";

import { IngestError } from "../IngestError";

const JsonlLineSchema = z.object({
  custom_id: z.string(),
});

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
        const parsed = JsonlLineSchema.parse(JSON.parse(line));
        ids.push(parsed.custom_id);
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

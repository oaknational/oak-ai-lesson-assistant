import { aiLogger } from "@oakai/logger";
import fs from "node:fs";

import { IngestError } from "../IngestError";

const log = aiLogger("ingest");

function getBatchDataDir({ ingestId }: { ingestId: string }) {
  return `${__dirname}/data/ingest_${ingestId}`;
}

export type GetBatchFileLine<T> = (datum: T) => Record<string, unknown>;

export function writeBatchFile<T>({
  ingestId,
  data,
  getBatchFileLine,
}: {
  ingestId: string;
  data: T[];
  getBatchFileLine: GetBatchFileLine<T>;
}) {
  return new Promise<{ filePath: string; batchDir: string }>(
    (resolve, reject) => {
      const timestamp = Math.floor(Date.now() / 1000);
      const batchDir = getBatchDataDir({ ingestId });
      fs.mkdirSync(batchDir, { recursive: true });
      const filePath = `${batchDir}/batch_${timestamp}.jsonl`;
      const writeStream = fs.createWriteStream(filePath, {
        flags: "w",
      });

      writeStream.on("finish", () => {
        resolve({ filePath, batchDir });

        log("Finished writing batch file", filePath);
      });

      writeStream.on("error", reject);

      for (const datum of data) {
        try {
          const line = getBatchFileLine(datum);

          writeStream.write(`${JSON.stringify(line)}\n`);
        } catch (cause) {
          const error = new IngestError("Failed to write batch file", {
            ingestId,
            errorDetail: data,
            cause,
          });
          reject(error);
        }
      }

      writeStream.end();
    },
  );
}

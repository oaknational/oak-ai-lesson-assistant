import fs from "node:fs";

function getBatchDataDir({ ingestId }: { ingestId: string }) {
  return `${__dirname}/batches/ingest_${ingestId}`;
}

export function writeBatchFile<T>({
  ingestId,
  data,
  getBatchFileLine,
}: {
  ingestId: string;
  data: T[];
  getBatchFileLine: (datum: T) => Record<string, unknown>;
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
        console.log("Finished writing batch file", filePath);
      });

      writeStream.on("error", reject);

      for (const datum of data) {
        try {
          console.log("Getting batch file line");
          const line = getBatchFileLine(datum);

          writeStream.write(`${JSON.stringify(line)}\n`);
        } catch (error) {
          reject(error);
        }
      }

      writeStream.end();
    },
  );
}

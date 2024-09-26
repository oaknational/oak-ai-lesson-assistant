import fs from "node:fs";

export async function writeBatchFile<T>({
  batchId,
  data,
  getBatchFileLine,
}: {
  batchId: string;
  data: T[];
  getBatchFileLine: (datum: T) => Record<string, unknown>;
}) {
  const writeStream = fs.createWriteStream(
    `${__dirname}/batch_${batchId}.jsonl`,
    {
      flags: "w",
    },
  );

  for (const datum of data) {
    const line = getBatchFileLine(datum);

    writeStream.write(`${JSON.stringify(line)}\n`);
  }
}

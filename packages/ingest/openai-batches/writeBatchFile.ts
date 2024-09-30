import fs from "node:fs";

import { getBatchDataDir } from "../data/getBatchDataDir";

export async function writeBatchFile<T>({
  ingestId,
  data,
  getBatchFileLine,
}: {
  ingestId: string;
  data: T[];
  getBatchFileLine: (datum: T) => Record<string, unknown>;
}) {
  const timestamp = Math.floor(Date.now() / 1000);
  const batchDir = getBatchDataDir({ ingestId });
  const filePath = `${batchDir}/batch_${ingestId}_${timestamp}.jsonl`;
  const writeStream = fs.createWriteStream(filePath, {
    flags: "w",
  });

  for (const datum of data) {
    const line = getBatchFileLine(datum);

    writeStream.write(`${JSON.stringify(line)}\n`);
  }

  return { filePath, batchDir };
}

import { aiLogger } from "@oakai/logger";

import { splitJsonlByRowsOrSize } from "../utils/splitJsonlByRowsOrSize";
import { OPEN_AI_BATCH_MAX_ROWS, OPEN_AI_BATCH_MAX_SIZE_MB } from "./constants";
import { getCustomIdsFromJsonlFile } from "./getCustomIdsFromJsonlFile";
import type { OpenAiBatchSubmitCallback } from "./submitOpenAiBatch";
import { submitOpenAiBatch } from "./submitOpenAiBatch";
import { uploadOpenAiBatchFile } from "./uploadOpenAiBatchFile";
import type { GetBatchFileLine } from "./writeBatchFile";
import { writeBatchFile } from "./writeBatchFile";

const log = aiLogger("ingest");

export async function startBatch<T>({
  ingestId,
  data,
  endpoint,
  getBatchFileLine,
  onSubmitted,
}: {
  ingestId: string;
  data: T[];
  endpoint: "/v1/chat/completions" | "/v1/embeddings";
  getBatchFileLine: GetBatchFileLine<T>;
  onSubmitted: OpenAiBatchSubmitCallback;
}) {
  const { filePath, batchDir } = await writeBatchFile({
    ingestId,
    data,
    getBatchFileLine,
  });

  const { filePaths } = await splitJsonlByRowsOrSize({
    inputFilePath: filePath,
    outputDir: batchDir,
    maxRows: OPEN_AI_BATCH_MAX_ROWS,
    maxFileSizeMB: OPEN_AI_BATCH_MAX_SIZE_MB,
  });

  for (const filePath of filePaths) {
    log.info(`Submitting batch for ${filePath}`);
    const { file } = await uploadOpenAiBatchFile({
      filePath,
    });
    const { batch: openaiBatch } = await submitOpenAiBatch({
      fileId: file.id,
      endpoint,
    });

    const customIds = await getCustomIdsFromJsonlFile({
      filePath,
    });

    log.info(`Submitted batch ${openaiBatch.id} for ${filePath}`);
    await onSubmitted({ openaiBatchId: openaiBatch.id, filePath, customIds });
  }
}

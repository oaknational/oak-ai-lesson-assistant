import { splitJsonlByRowsOrSize } from "../utils/splitJsonlByRowsOrSize";
import { OPEN_AI_BATCH_MAX_ROWS, OPEN_AI_BATCH_MAX_SIZE_MB } from "./constants";
import { getCustomIdsFromJsonlFile } from "./getCustomIdsFromJsonlFile";
import {
  OpenAiBatchSubmitCallback,
  submitOpenAiBatch,
} from "./submitOpenAiBatch";
import { uploadOpenAiBatchFile } from "./uploadOpenAiBatchFile";
import { GetBatchFileLine, writeBatchFile } from "./writeBatchFile";

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

    await onSubmitted({ openaiBatchId: openaiBatch.id, filePath, customIds });
  }
}
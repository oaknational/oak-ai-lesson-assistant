import {
  OPEN_AI_BATCH_MAX_ROWS,
  OPEN_AI_BATCH_MAX_SIZE_MB,
} from "../openai-batches/constants";
import {
  OpenAiBatchSubmitCallback,
  submitOpenAiBatch,
} from "../openai-batches/submitOpenAiBatch";
import { uploadOpenAiBatchFile } from "../openai-batches/uploadOpenAiBatchFile";
import { writeBatchFile } from "../openai-batches/writeBatchFile";
import { splitJsonlByRowsOrSize } from "../utils/splitJsonlByRowsOrSize";
import {
  EmbeddingBatchLineProps,
  getPartEmbeddingBatchFileLine,
} from "./getPartEmbeddingBatchFileLine";

export async function startEmbedding({
  ingestId,
  parts,
  onSubmitted,
}: {
  ingestId: string;
  parts: EmbeddingBatchLineProps[];
  onSubmitted: OpenAiBatchSubmitCallback;
}) {
  const { filePath, batchDir } = await writeBatchFile({
    ingestId,
    data: parts,
    getBatchFileLine: getPartEmbeddingBatchFileLine,
  });

  const { filePaths } = await splitJsonlByRowsOrSize({
    inputFilePath: filePath,
    outputDir: batchDir,
    maxRows: OPEN_AI_BATCH_MAX_ROWS,
    maxFileSizeMB: OPEN_AI_BATCH_MAX_SIZE_MB,
  });

  // submit batches and add records in db
  for (const filePath of filePaths) {
    const { file } = await uploadOpenAiBatchFile({
      filePath,
    });
    const { batch: openaiBatch } = await submitOpenAiBatch({
      fileId: file.id,
      endpoint: "/v1/embeddings",
    });

    await onSubmitted({ openaiBatchId: openaiBatch.id, filePath });
  }
}

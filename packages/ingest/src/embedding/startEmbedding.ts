import { startBatch } from "../openai-batches/startBatch";
import type { OpenAiBatchSubmitCallback } from "../openai-batches/submitOpenAiBatch";
import type { EmbeddingBatchLineProps } from "./getPartEmbeddingBatchFileLine";
import { getPartEmbeddingBatchFileLine } from "./getPartEmbeddingBatchFileLine";

export async function startEmbedding({
  ingestId,
  parts,
  onSubmitted,
}: {
  ingestId: string;
  parts: EmbeddingBatchLineProps[];
  onSubmitted: OpenAiBatchSubmitCallback;
}) {
  return startBatch({
    ingestId,
    data: parts,
    endpoint: "/v1/embeddings",
    getBatchFileLine: getPartEmbeddingBatchFileLine,
    onSubmitted,
  });
}

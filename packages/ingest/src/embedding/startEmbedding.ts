import { startBatch } from "../openai-batches/startBatch";
import { OpenAiBatchSubmitCallback } from "../openai-batches/submitOpenAiBatch";
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
  return startBatch({
    ingestId,
    data: parts,
    endpoint: "/v1/embeddings",
    getBatchFileLine: getPartEmbeddingBatchFileLine,
    onSubmitted,
  });
}

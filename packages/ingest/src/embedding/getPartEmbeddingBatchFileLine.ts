import { batchLineEmbedding } from "../openai-batches/batchLineEmbedding";

export function getPartEmbeddingBatchFileLine({
  lessonPlanPartId,
  textToEmbed,
}: {
  lessonPlanPartId: string;
  textToEmbed: string;
}) {
  return batchLineEmbedding({
    lineId: lessonPlanPartId,
    textToEmbed,
  });
}

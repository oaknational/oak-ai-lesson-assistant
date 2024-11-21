import type { PersistedIngest } from "../db-helpers/getIngestById";
import { batchLineEmbedding } from "../openai-batches/batchLineEmbedding";
import { createCustomId } from "../openai-batches/customId";

export type EmbeddingBatchLineProps = {
  lessonId: string;
  partKey: string;
  lessonPlanPartId: string;
  textToEmbed: string;
  ingest: PersistedIngest;
};
export function getPartEmbeddingBatchFileLine({
  lessonPlanPartId,
  lessonId,
  partKey,
  textToEmbed,
  ingest,
}: EmbeddingBatchLineProps) {
  return batchLineEmbedding({
    customId: createCustomId({
      task: "embed-lesson-plan-parts",
      lessonId,
      lessonPlanPartId,
      partKey,
    }),
    textToEmbed,
    embeddingModel: ingest.config.embeddingModel,
    embeddingDimensions: ingest.config.embeddingDimensions,
  });
}

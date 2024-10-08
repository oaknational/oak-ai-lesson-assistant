import { batchLineEmbedding } from "../openai-batches/batchLineEmbedding";
import { createCustomId } from "../openai-batches/customId";

export type EmbeddingBatchLineProps = {
  lessonId: string;
  partKey: string;
  lessonPlanPartId: string;
  textToEmbed: string;
};
export function getPartEmbeddingBatchFileLine({
  lessonPlanPartId,
  lessonId,
  partKey,
  textToEmbed,
}: EmbeddingBatchLineProps) {
  return batchLineEmbedding({
    customId: createCustomId({
      task: "embed-lesson-plan-parts",
      lessonId,
      lessonPlanPartId,
      partKey,
    }),
    textToEmbed,
  });
}

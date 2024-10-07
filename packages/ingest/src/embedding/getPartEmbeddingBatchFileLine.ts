import { batchLineEmbedding } from "../openai-batches/batchLineEmbedding";
import { createCustomId } from "../openai-batches/customId";

export function getPartEmbeddingBatchFileLine({
  lessonPlanPartId,
  lessonId,
  partKey,
  textToEmbed,
}: {
  lessonId: string;
  partKey: string;
  lessonPlanPartId: string;
  textToEmbed: string;
}) {
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

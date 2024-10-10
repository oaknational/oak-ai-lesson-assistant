import { PrismaClientWithAccelerate } from "@oakai/db";

import { getLatestIngestId } from "../db-helpers/getLatestIngestId";
import { handleEmbeddingBatchSuccess } from "../embedding/handleEmbeddingBatchSuccess";
import { handleOpenAiBatchErrorFile } from "../openai-batches/handleOpenAiBatchErrorFile";
import { retrieveOpenAiBatch } from "../openai-batches/retrieveOpenAiBatch";

/**
 * Check status of lesson plan generation batches and action
 */
export async function lpPartsEmbedSync({
  prisma,
}: {
  prisma: PrismaClientWithAccelerate;
}) {
  const ingestId = await getLatestIngestId({ prisma });

  const embeddingsBatches = await prisma.ingestOpenAiBatch.findMany({
    where: {
      ingestId,
      batchType: "embedding",
      status: "pending",
    },
  });

  if (embeddingsBatches.length === 0) {
    console.log("No embedding batches to check, exiting early");
    return;
  }

  console.log(`Checking ${embeddingsBatches.length} embedding batches`);

  for (const batch of embeddingsBatches) {
    const { batch: openaiBatch } = await retrieveOpenAiBatch({
      batchId: batch.openaiBatchId,
    });
    switch (openaiBatch.status) {
      case "validating":
      case "in_progress":
      case "finalizing":
        console.log(`Batch ${batch.id} is ${openaiBatch.status}`);
        break;

      case "completed":
        if (openaiBatch.error_file_id) {
          console.log(`Batch ${batch.id} has error file, handling...`);
          await handleOpenAiBatchErrorFile({
            prisma,
            ingestId,
            batchId: batch.id,
            errorFileId: openaiBatch.error_file_id,
            task: "embed-lesson-plan-parts",
          });
        }

        if (openaiBatch.output_file_id) {
          console.log(`Batch ${batch.id} succeeded, handling...`);
          await handleEmbeddingBatchSuccess({
            prisma,
            ingestId,
            batchId: batch.id,
            outputFileId: openaiBatch.output_file_id,
          });
        }

        break;

      default:
        await prisma.ingestOpenAiBatch.update({
          where: {
            id: batch.id,
          },
          data: {
            status: "failed",
          },
        });
    }
  }
}

import type { PrismaClientWithAccelerate } from "@oakai/db";

import { handleLessonPlanBatchSuccess } from "../generate-lesson-plans/handleLessonPlanBatchSuccess";
import { handleOpenAiBatchErrorFile } from "../openai-batches/handleOpenAiBatchErrorFile";
import { retrieveOpenAiBatch } from "../openai-batches/retrieveOpenAiBatch";
import type { IngestLogger } from "../types";

/**
 * Check status of lesson plan generation batches and action
 */
export async function lpBatchSync({
  prisma,
  log,
  ingestId,
}: {
  prisma: PrismaClientWithAccelerate;
  log: IngestLogger;
  ingestId: string;
}) {
  const batches = await prisma.ingestOpenAiBatch.findMany({
    where: {
      ingestId,
      batchType: "lesson_plan_generation",
      status: "pending",
    },
  });
  log.info(`Found ${batches.length} pending lesson plan generation batches`);
  for (const batch of batches) {
    const { batch: openaiBatch } = await retrieveOpenAiBatch({
      batchId: batch.openaiBatchId,
    });
    switch (openaiBatch.status) {
      case "validating":
      case "in_progress":
      case "finalizing":
        log.info(`Batch ${batch.id} is ${openaiBatch.status}`);
        break;

      case "completed":
        if (openaiBatch.error_file_id) {
          log.info(`Batch ${batch.id} has error file, handling...`);
          await handleOpenAiBatchErrorFile({
            ingestId,
            prisma,
            batchId: batch.id,
            errorFileId: openaiBatch.error_file_id,
            task: "generate-lesson-plans",
          });
        }

        if (openaiBatch.output_file_id) {
          log.info(`Batch ${batch.id} succeeded, handling...`);
          await handleLessonPlanBatchSuccess({
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

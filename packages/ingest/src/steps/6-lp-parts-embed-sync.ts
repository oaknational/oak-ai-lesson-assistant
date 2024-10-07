import { PrismaClientWithAccelerate } from "@oakai/db";

import { IngestError } from "../IngestError";
import { getLatestIngestId } from "../db-helpers/getLatestIngestId";
import { updateLessonsState } from "../db-helpers/updateLessonsState";
import { parseBatchEmbedding } from "../embedding/parseBatchEmbedding";
import { downloadOpenAiFile } from "../openai-batches/downloadOpenAiFile";
import { handleOpenAIBatchErrorFile } from "../openai-batches/handleOpenAiBatchErrorFile";
import { retrieveOpenAiBatch } from "../openai-batches/retrieveOpenAiBatch";
import { jsonlToArray } from "../utils/jsonlToArray";

export async function lpPartsEmbedSync({
  prisma,
}: {
  prisma: PrismaClientWithAccelerate;
}) {
  const ingestId = await getLatestIngestId({ prisma });

  /**
   * Check status of lesson plan generation batches and action
   */
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
          // create error record
          await handleOpenAIBatchErrorFile({
            prisma,
            ingestId,
            batchId: batch.id,
            errorFileId: openaiBatch.error_file_id,
            task: "embed-lesson-plan-parts",
          });
        }

        if (openaiBatch.output_file_id) {
          const { file } = await downloadOpenAiFile({
            fileId: openaiBatch.output_file_id,
          });
          const text = await file.text();
          const jsonArray = jsonlToArray(text);

          const lessonIdsFailed: Set<string> = new Set();
          const lessonIdsCompleted: Set<string> = new Set();

          for (const json of jsonArray) {
            console.log("Embed");
            let lessonId: string | undefined = undefined;
            try {
              const batchEmbedding = parseBatchEmbedding(json);
              lessonId = batchEmbedding.lessonId;
              console.log(`Embedding lesson ${lessonId}`);
              const { lessonPlanPartId, embedding } = batchEmbedding;

              const vector = `[${embedding.join(",")}]`;
              const res = await prisma.$executeRaw`
                  UPDATE ingest.ingest_lesson_plan_part
                  SET embedding = ${vector}::vector 
                  WHERE id = ${lessonPlanPartId}`;

              if (res !== 1) {
                lessonIdsFailed.add(lessonId);
                continue;
              }
            } catch (error) {
              console.log(error);
              if (error instanceof IngestError && error.lessonId) {
                lessonId = error.lessonId;
              }
              if (lessonId) {
                lessonIdsFailed.add(lessonId);
              }
              continue;
            }

            lessonIdsCompleted.add(lessonId);
          }

          await updateLessonsState({
            prisma,
            ingestId,
            lessonIds: Array.from(lessonIdsCompleted),
            step: "embedding",
            stepStatus: "completed",
          });
          /**
           * In the very unlikely event that some parts failed to embed
           * and others didn't, we mark the lesson as failed.
           */
          await updateLessonsState({
            prisma,
            ingestId,
            lessonIds: Array.from(lessonIdsFailed),
            step: "embedding",
            stepStatus: "failed",
          });
          await prisma.ingestOpenAiBatch.update({
            where: {
              id: batch.id,
            },
            data: {
              outputFileId: openaiBatch.output_file_id,
              receivedAt: new Date(),
              status: "completed",
            },
          });

          console.log(`Batch ${batch.id} completed`);
          console.log(`Failed: ${lessonIdsFailed.size} lessons`);
          console.log(`Completed: ${lessonIdsCompleted.size} lessons`);
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

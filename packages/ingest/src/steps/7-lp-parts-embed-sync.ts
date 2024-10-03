import { prisma, PrismaClientWithAccelerate } from "@oakai/db";

import { downloadOpenAiFile } from "../openai-batches/downloadOpenAiFile";
import { retrieveOpenAiBatch } from "../openai-batches/retrieveOpenAiBatch";
import { EmbeddingsBatchResponseSchema } from "../zod-schema/zodSchema";
import {
  embeddingCustomIdToLessonId,
  getLatestIngestId,
  handleOpenAIBatchErrorFile,
  updateLessonsState,
} from "./helpers";

lpPartsEmbedSync({
  prisma,
});

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
  for (const batch of embeddingsBatches) {
    const { batch: openaiBatch } = await retrieveOpenAiBatch({
      batchId: batch.openaiBatchId,
    });
    switch (openaiBatch.status) {
      case "validating":
      case "in_progress":
      case "finalizing":
        break;

      case "completed":
        {
          if (openaiBatch.error_file_id) {
            // create error record
            await handleOpenAIBatchErrorFile({
              prisma,
              ingestId,
              batchId: batch.id,
              errorFileId: openaiBatch.error_file_id,
              customIdToLessonId: embeddingCustomIdToLessonId,
            });
          }

          if (openaiBatch.output_file_id) {
            const { file } = await downloadOpenAiFile({
              fileId: openaiBatch.output_file_id,
            });
            const text = await file.text();
            const lines = text.split("\n");
            const jsonArray = lines
              .filter((line) => line.trim() !== "")
              .map((line) => JSON.parse(line));

            const lessonIdsFailed: string[] = [];
            const lessonIdsCompleted: string[] = [];

            for (const json of jsonArray) {
              const parsed = EmbeddingsBatchResponseSchema.parse(json);
              const { custom_id: lessonId } = parsed;

              if (parsed.error) {
                lessonIdsFailed.push(lessonId);
                continue;
              }

              const embedding = parsed.response.body.data?.[0]?.embedding;

              if (!embedding) {
                lessonIdsFailed.push(lessonId);
                continue;
              }

              const [lessonPlanId, key] = parsed.custom_id.split("-");

              if (!lessonPlanId || !key) {
                lessonIdsFailed.push(lessonId);
                continue;
              }

              const vector = `[${embedding.join(",")}]`;
              const res = await prisma.$executeRaw`
                UPDATE ingest_lesson_plan_part
                SET embedding = ${vector}::vector 
                SET status = 'embedded'
                WHERE lesson_plan_id = ${lessonPlanId} AND key = ${key}`;

              if (res !== 1) {
                lessonIdsFailed.push(lessonId);
                continue;
              }

              lessonIdsCompleted.push(lessonId);
            }

            await updateLessonsState({
              prisma,
              ingestId,
              lessonIds: lessonIdsFailed,
              step: "embedding",
              stepStatus: "failed",
            });
            await updateLessonsState({
              prisma,
              ingestId,
              lessonIds: lessonIdsCompleted,
              step: "embedding",
              stepStatus: "completed",
            });
            await prisma.ingestOpenAiBatch.update({
              where: {
                id: batch.id,
              },
              data: {
                outputFileId: openaiBatch.output_file_id,
                status: "completed",
              },
            });
          }
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

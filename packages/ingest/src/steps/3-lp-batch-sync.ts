import { PrismaClientWithAccelerate } from "@oakai/db";

import { IngestError } from "../IngestError";
import { getLatestIngestId } from "../db-helpers/getLatestIngestId";
import { updateLessonsState } from "../db-helpers/updateLessonsState";
import { parseBatchLessonPlan } from "../generate-lesson-plans/parseBatchLessonPlan";
import { downloadOpenAiFile } from "../openai-batches/downloadOpenAiFile";
import { handleOpenAIBatchErrorFile } from "../openai-batches/handleOpenAiBatchErrorFile";
import { retrieveOpenAiBatch } from "../openai-batches/retrieveOpenAiBatch";
import { jsonlToArray } from "../utils/jsonlToArray";

/**
 * Check status of lesson plan generation batches and action
 */
export async function lpBatchSync({
  prisma,
}: {
  prisma: PrismaClientWithAccelerate;
}) {
  const ingestId = await getLatestIngestId({ prisma });
  const batches = await prisma.ingestOpenAiBatch.findMany({
    where: {
      ingestId,
      batchType: "lesson_plan_generation",
      status: "pending",
    },
  });
  console.log(`Found ${batches.length} pending lesson plan generation batches`);
  for (const batch of batches) {
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
          await handleOpenAIBatchErrorFile({
            ingestId,
            prisma,
            batchId: batch.id,
            errorFileId: openaiBatch.error_file_id,
            task: "generate-lesson-plans",
          });
        }

        if (openaiBatch.output_file_id) {
          const { file } = await downloadOpenAiFile({
            fileId: openaiBatch.output_file_id,
          });
          const text = await file.text();
          const lessonIdsFailed: string[] = [];
          const lessonIdsCompleted: string[] = [];
          const jsonArray = jsonlToArray(text);

          for (const json of jsonArray) {
            try {
              const { lessonPlan, lessonId } = parseBatchLessonPlan(json);

              await prisma.ingestLessonPlan.create({
                data: {
                  ingestId,
                  batchId: batch.id,
                  lessonId,
                  data: lessonPlan,
                },
              });

              lessonIdsCompleted.push(lessonId);
            } catch (cause) {
              if (cause instanceof IngestError && cause.lessonId) {
                lessonIdsFailed.push(cause.lessonId);
                continue;
              }
              throw new IngestError("Failed to process jsonl line", {
                cause,
                errorDetail: json,
              });
            }
          }

          await updateLessonsState({
            prisma,
            ingestId,
            lessonIds: lessonIdsFailed,
            step: "lesson_plan_generation",
            stepStatus: "failed",
          });
          await updateLessonsState({
            prisma,
            ingestId,
            lessonIds: lessonIdsCompleted,
            step: "lesson_plan_generation",
            stepStatus: "completed",
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

          console.log(
            `Updated ${lessonIdsCompleted.length} lessons with lesson plans`,
          );
          console.log(
            `Failed to update ${lessonIdsFailed.length} lessons with lesson plans`,
          );
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

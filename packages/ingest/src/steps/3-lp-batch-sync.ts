import { CompletedLessonPlanSchema } from "@oakai/aila/src/protocol/schema";
import { PrismaClientWithAccelerate } from "@oakai/db";

import { getLatestIngestId } from "../db-helpers/getLatestIngestId";
import { updateLessonsState } from "../db-helpers/updateLessonsState";
import { downloadOpenAiFile } from "../openai-batches/downloadOpenAiFile";
import { retrieveOpenAiBatch } from "../openai-batches/retrieveOpenAiBatch";
import { CompletionBatchResponseSchema } from "../zod-schema/zodSchema";
import { handleOpenAIBatchErrorFile } from "./helpers";

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
        {
          if (openaiBatch.error_file_id) {
            // create error record
            await handleOpenAIBatchErrorFile({
              prisma,
              batchId: batch.id,
              errorFileId: openaiBatch.error_file_id,
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
              const parsed = CompletionBatchResponseSchema.parse(json);
              const { custom_id: lessonId } = parsed;

              if (parsed.error) {
                //
                lessonIdsFailed.push(lessonId);
                continue;
              }

              const maybeLessonPlanString =
                parsed.response.body.choices?.[0]?.message?.content;

              if (!maybeLessonPlanString) {
                //
                lessonIdsFailed.push(lessonId);
                continue;
              }

              let lessonPlan;
              try {
                lessonPlan = CompletedLessonPlanSchema.parse(
                  JSON.parse(maybeLessonPlanString),
                );
              } catch (error) {
                lessonIdsFailed.push(lessonId);
                continue;
              }

              // hack to remove basedOn as it often erroneously gets populated by LLM
              delete lessonPlan.basedOn;

              const lessonPlanRecord = await prisma.ingestLessonPlan.create({
                data: {
                  ingestId,
                  batchId: batch.id,
                  lessonId,
                  data: lessonPlan,
                },
              });

              await prisma.ingestLesson.update({
                where: {
                  id: lessonPlanRecord.lessonId,
                },
                data: {
                  lessonPlanId: lessonPlanRecord.id,
                },
              });

              lessonIdsCompleted.push(lessonId);
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

import { PrismaClientWithAccelerate } from "@oakai/db";

import { IngestError } from "../IngestError";
import { updateLessonsState } from "../db-helpers/updateLessonsState";
import { downloadOpenAiFile } from "../openai-batches/downloadOpenAiFile";
import { jsonlToArray } from "../utils/jsonlToArray";
import { parseBatchLessonPlan } from "./parseBatchLessonPlan";

/**
 * When a lesson plan batch is successfully processed, this function
 * extracts the generated lesson plans and stores them in the
 * database.
 */
export async function handleLessonPlanBatchSuccess({
  prisma,
  ingestId,
  batchId,
  outputFileId,
}: {
  prisma: PrismaClientWithAccelerate;
  ingestId: string;
  batchId: string;
  outputFileId: string;
}) {
  const { file } = await downloadOpenAiFile({
    fileId: outputFileId,
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
          batchId,
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
      id: batchId,
    },
    data: {
      outputFileId: outputFileId,
      receivedAt: new Date(),
      status: "completed",
    },
  });

  console.log(`Updated ${lessonIdsCompleted.length} lessons with lesson plans`);
  console.log(
    `Failed to update ${lessonIdsFailed.length} lessons with lesson plans`,
  );
}

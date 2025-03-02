import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import { IngestError } from "../IngestError";
import { createErrorRecord } from "../db-helpers/createErrorRecord";
import { updateLessonsState } from "../db-helpers/updateLessonsState";
import { downloadOpenAiFile } from "../openai-batches/downloadOpenAiFile";
import { jsonlToArray } from "../utils/jsonlToArray";
import { parseBatchLessonPlan } from "./parseBatchLessonPlan";

const log = aiLogger("ingest");

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
      let lessonId: string | undefined;
      if (cause instanceof IngestError && cause.lessonId) {
        lessonIdsFailed.push(cause.lessonId);
        continue;
      }
      await createErrorRecord({
        prisma,
        ingestId,
        lessonId,
        step: "lesson_plan_generation",
        errorMessage: cause instanceof Error ? cause.message : String(cause),
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

  log.info(`Updated ${lessonIdsCompleted.length} lessons with lesson plans`);
  log.info(
    `Failed to update ${lessonIdsFailed.length} lessons with lesson plans`,
  );
}

import { PrismaClientWithAccelerate } from "@oakai/db";

import { IngestError } from "../IngestError";
import { createErrorRecord } from "../db-helpers/createErrorRecord";
import { updateLessonsState } from "../db-helpers/updateLessonsState";
import { downloadOpenAiFile } from "../openai-batches/downloadOpenAiFile";
import { jsonlToArray } from "../utils/jsonlToArray";
import { parseBatchEmbedding } from "./parseBatchEmbedding";

/**
 * When an embedding batch is successfully processed, this function
 * extracts the embeddings and updates the lesson plan parts with them.
 */
export async function handleEmbeddingBatchSuccess({
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
  const jsonArray = jsonlToArray(text);

  const errors: IngestError[] = [];
  const lessonIdsFailed: Set<string> = new Set();
  const lessonIdsCompleted: Set<string> = new Set();

  for (const json of jsonArray) {
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
      if (error instanceof IngestError && error.lessonId) {
        lessonId = error.lessonId;
        errors.push(error);
      }
      if (lessonId) {
        lessonIdsFailed.add(lessonId);
      }
      await createErrorRecord({
        prisma,
        ingestId,
        lessonId,
        step: "embedding",
        errorMessage: error instanceof Error ? error.message : String(error),
      });

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
      id: batchId,
    },
    data: {
      outputFileId: outputFileId,
      receivedAt: new Date(),
      status: "completed",
    },
  });

  console.log(`Batch ${batchId} completed`);
  console.log(`Failed: ${lessonIdsFailed.size} lessons`);
  console.log(`Completed: ${lessonIdsCompleted.size} lessons`);
}

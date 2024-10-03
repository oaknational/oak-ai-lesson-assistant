import { prisma, PrismaClientWithAccelerate } from "@oakai/db";

import { lessonPlanPartsBatchFileLine } from "../generate-lesson-plan-parts/lessonPlanPartsBatchFileLine";
import { splitJsonlByRowsOrSize } from "../jsonl-helpers/splitJsonlByRowsOrSize";
import {
  OPEN_AI_BATCH_MAX_ROWS,
  OPEN_AI_BATCH_MAX_SIZE_MB,
} from "../openai-batches/constants";
import { submitOpenAiBatch } from "../openai-batches/submitOpenAiBatch";
import { uploadOpenAiBatchFile } from "../openai-batches/uploadOpenAiBatchFile";
import { writeBatchFile } from "../openai-batches/writeBatchFile";
import {
  getLatestIngestId,
  getLessonsByState,
  updateLessonsState,
} from "./helpers";

lpPartsEmbedStart({
  prisma,
});

/**
 * Start the process of embedding lesson plan parts
 */
export async function lpPartsEmbedStart({
  prisma,
}: {
  prisma: PrismaClientWithAccelerate;
}) {
  const ingestId = await getLatestIngestId({ prisma });
  const lessons = await getLessonsByState({
    prisma,
    ingestId,
    step: "chunking",
    stepStatus: "completed",
  });
  await updateLessonsState({
    prisma,
    ingestId,
    lessonIds: lessons.map((l) => l.id),
    step: "embedding",
    stepStatus: "started",
  });

  const allPartsToEmbed = lessons
    .map((lesson) =>
      lesson.lessonPlanParts.map((part) => ({
        lessonPlanPartId: part.id,
        textToEmbed: part.valueText,
      })),
    )
    .flat();

  if (allPartsToEmbed.length === 0) {
    console.log("No lesson plan parts to embed, exiting early");
    return;
  }

  const { filePath, batchDir } = await writeBatchFile({
    ingestId,
    data: allPartsToEmbed,
    getBatchFileLine: lessonPlanPartsBatchFileLine,
  });

  const { filePaths } = await splitJsonlByRowsOrSize({
    inputFilePath: filePath,
    outputDir: batchDir,
    maxRows: OPEN_AI_BATCH_MAX_ROWS,
    maxFileSizeMB: OPEN_AI_BATCH_MAX_SIZE_MB,
  });

  // submit batches and add records in db
  for (const filePath of filePaths) {
    const { file } = await uploadOpenAiBatchFile({
      filePath,
    });
    const { batch: openaiBatch } = await submitOpenAiBatch({
      fileId: file.id,
      endpoint: "/v1/embeddings",
    });
    await prisma.ingestOpenAiBatch.create({
      data: {
        ingestId,
        batchType: "embedding",
        openaiBatchId: openaiBatch.id,
        inputFilePath: filePath,
        status: "pending",
      },
    });
    await prisma.ingestLessonPlanPart.updateMany({
      where: {
        id: {
          in: allPartsToEmbed.map((p) => p.lessonPlanPartId),
        },
      },
      data: {
        batchId: openaiBatch.id,
      },
    });
  }
}

import { PrismaClientWithAccelerate } from "@oakai/db";

import { getLatestIngestId } from "../db-helpers/getLatestIngestId";
import { getLessonsByState } from "../db-helpers/getLessonsByState";
import { Step, getPrevStep } from "../db-helpers/step";
import { updateLessonsState } from "../db-helpers/updateLessonsState";
import { getLessonPlanBatchFileLine } from "../generate-lesson-plans/getLessonPlanBatchFileLine";
import {
  OPEN_AI_BATCH_MAX_SIZE_MB,
  OPEN_AI_BATCH_MAX_ROWS,
} from "../openai-batches/constants";
import { submitOpenAiBatch } from "../openai-batches/submitOpenAiBatch";
import { uploadOpenAiBatchFile } from "../openai-batches/uploadOpenAiBatchFile";
import { writeBatchFile } from "../openai-batches/writeBatchFile";
import { splitJsonlByRowsOrSize } from "../utils/splitJsonlByRowsOrSize";
import { CaptionsSchema } from "../zod-schema/zodSchema";

const step: Step = "lesson_plan_generation";
const prevStep = getPrevStep(step);
/**
 * Get all lessons which are ready for lesson plan generation, and write
 * request batch, upload it, and submit it
 */
export async function lpBatchStart({
  prisma,
}: {
  prisma: PrismaClientWithAccelerate;
}) {
  const ingestId = await getLatestIngestId({ prisma });
  const lessons = await getLessonsByState({
    prisma,
    ingestId,
    step: prevStep,
    stepStatus: "completed",
  });

  await updateLessonsState({
    prisma,
    ingestId,
    lessonIds: lessons.map((l) => l.id),
    step,
    stepStatus: "started",
  });

  if (lessons.length === 0) {
    console.log("No lessons to generate lesson plans for");
    return;
  }

  console.log(`Generating lesson plans for ${lessons.length} lessons`);

  try {
    console.log(`Generating lesson plans for ${lessons.length} lesson`);
    const { filePath, batchDir } = await writeBatchFile({
      ingestId,
      data: lessons.map((lesson) => ({
        lessonId: lesson.id,
        rawLesson: lesson.data,
        captions: CaptionsSchema.parse(lesson.captions?.data),
      })),
      getBatchFileLine: getLessonPlanBatchFileLine,
    });
    const { filePaths } = await splitJsonlByRowsOrSize({
      inputFilePath: filePath,
      outputDir: batchDir,
      maxRows: OPEN_AI_BATCH_MAX_ROWS,
      maxFileSizeMB: OPEN_AI_BATCH_MAX_SIZE_MB,
    });

    for (const filePath of filePaths) {
      const { file } = await uploadOpenAiBatchFile({
        filePath,
      });
      const { batch: openaiBatch } = await submitOpenAiBatch({
        fileId: file.id,
        endpoint: "/v1/chat/completions",
      });
      await prisma.ingestOpenAiBatch.create({
        data: {
          ingestId,
          batchType: "lesson_plan_generation",
          openaiBatchId: openaiBatch.id,
          inputFilePath: filePath,
          status: "pending",
        },
      });
    }
  } catch (error) {
    console.error("Error generating lesson plans", error);
    await updateLessonsState({
      prisma,
      ingestId,
      lessonIds: lessons.map((l) => l.id),
      step,
      stepStatus: "failed",
    });
  }
}

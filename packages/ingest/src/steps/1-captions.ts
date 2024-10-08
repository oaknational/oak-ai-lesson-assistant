import { PrismaClientWithAccelerate } from "@oakai/db";

import { IngestError } from "../IngestError";
import { getCaptionsByFileName } from "../captions/getCaptionsByFileName";
import { getCaptionsFileNameForLesson } from "../captions/getCaptionsFileNameForLesson";
import { createCaptionsRecord } from "../db-helpers/createCaptionsRecord";
import { createErrorRecord } from "../db-helpers/createErrorRecord";
import { getLatestIngestId } from "../db-helpers/getLatestIngestId";
import { loadLessonsAndUpdateState } from "../db-helpers/loadLessonsAndUpdateState";
import { Step, getPrevStep } from "../db-helpers/step";
import { updateLessonsState } from "../db-helpers/updateLessonsState";
import { Captions } from "../zod-schema/zodSchema";

const currentStep: Step = "captions_fetch";
const prevStep = getPrevStep(currentStep);

/**
 * This function fetches and stores captions for the lessons imported in the most recent ingest.
 */
export async function captions({
  prisma,
}: {
  prisma: PrismaClientWithAccelerate;
}) {
  const ingestId = await getLatestIngestId({ prisma });

  const lessons = await loadLessonsAndUpdateState({
    prisma,
    ingestId,
    prevStep,
    currentStep,
  });

  console.log(`Fetching captions for ${lessons.length} lessons`);

  const failedLessonIds: string[] = [];
  const completedLessonIds: string[] = [];

  /**
   * Fetch captions for each lesson, and store them in the database
   */
  for (const lesson of lessons) {
    try {
      const fileName = getCaptionsFileNameForLesson(lesson.data);
      const { caption: captions } = await getCaptionsByFileName(fileName);

      await persistOnSuccess({
        prisma,
        ingestId,
        lesson,
        captions,
      });

      completedLessonIds.push(lesson.id);
    } catch (cause) {
      const error = new IngestError("Failed to fetch captions", {
        cause,
      });
      await persistOnError({
        prisma,
        ingestId,
        lessonId: lesson.id,
        error,
      });
      failedLessonIds.push(lesson.id);
    }
  }

  console.log(`Failed: ${failedLessonIds.length} lessons`);
  console.log(`Completed: ${completedLessonIds.length} lessons`);
}

async function persistOnSuccess({
  prisma,
  ingestId,
  lesson,
  captions,
}: {
  prisma: PrismaClientWithAccelerate;
  ingestId: string;
  lesson: { id: string; ingestId: string };
  captions: Captions;
}) {
  await createCaptionsRecord({
    prisma,
    ingestId: lesson.ingestId,
    lessonId: lesson.id,
    captions,
  });
  await updateLessonsState({
    prisma,
    ingestId,
    lessonIds: [lesson.id],
    step: currentStep,
    stepStatus: "completed",
  });
}

async function persistOnError({
  prisma,
  ingestId,
  lessonId,
  error,
}: {
  prisma: PrismaClientWithAccelerate;
  ingestId: string;
  lessonId: string;
  error: IngestError;
}) {
  await createErrorRecord({
    prisma,
    ingestId,
    lessonId,
    step: currentStep,
    errorMessage: error.message,
  });
  await updateLessonsState({
    prisma,
    ingestId,
    lessonIds: [lessonId],
    step: currentStep,
    stepStatus: "failed",
  });
}

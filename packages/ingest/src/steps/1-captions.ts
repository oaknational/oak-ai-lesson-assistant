import type { PrismaClientWithAccelerate } from "@oakai/db";

import { IngestError } from "../IngestError";
import { getCaptionsByFileName } from "../captions/getCaptionsByFileName";
import { getCaptionsFileNameForLesson } from "../captions/getCaptionsFileNameForLesson";
import { createCaptionsRecord } from "../db-helpers/createCaptionsRecord";
import { createErrorRecord } from "../db-helpers/createErrorRecord";
import { getIngestById } from "../db-helpers/getIngestById";
import { loadLessonsAndUpdateState } from "../db-helpers/loadLessonsAndUpdateState";
import type { Step} from "../db-helpers/step";
import { getPrevStep } from "../db-helpers/step";
import { updateLessonsState } from "../db-helpers/updateLessonsState";
import type { IngestLogger } from "../types";
import type { Captions } from "../zod-schema/zodSchema";

const currentStep: Step = "captions_fetch";
const prevStep = getPrevStep(currentStep);

/**
 * This function fetches and stores captions for the lessons imported in the most recent ingest.
 */
export async function captions({
  prisma,
  log,
  ingestId,
}: {
  prisma: PrismaClientWithAccelerate;
  log: IngestLogger;
  ingestId: string;
}) {
  const ingest = await getIngestById({ prisma, ingestId });

  const lessons = await loadLessonsAndUpdateState({
    prisma,
    ingestId,
    prevStep,
    currentStep,
  });

  if (ingest.config.sourcePartsToInclude === "title-subject-key-stage") {
    log.info("Skipping captions fetch for title-subject-key-stage ingest");
    await updateLessonsState({
      prisma,
      ingestId,
      lessonIds: lessons.map((lesson) => lesson.id),
      step: currentStep,
      stepStatus: "completed",
    });
    return;
  }

  log.info(`Fetching captions for ${lessons.length} lessons`);

  const failedLessonIds: string[] = [];
  const completedLessonIds: string[] = [];

  /**
   * Fetch captions for each lesson, and store them in the database
   */
  for (const lesson of lessons) {
    try {
      const fileName = getCaptionsFileNameForLesson({
        videoTitle: lesson.data.videoTitle,
      });
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

  log.info(`Failed: ${failedLessonIds.length} lessons`);
  log.info(`Completed: ${completedLessonIds.length} lessons`);
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

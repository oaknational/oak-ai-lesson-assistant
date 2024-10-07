import { PrismaClientWithAccelerate } from "@oakai/db";

import { IngestError } from "../IngestError";
import { getCaptionsByFileName } from "../captions/getCaptionsByFileName";
import { getCaptionsFileNameForLesson } from "../captions/getCaptionsFileNameForLesson";
import { createCaptionsRecord } from "../db-helpers/createCaptionsRecord";
import { createErrorRecord } from "../db-helpers/createErrorRecord";
import { getLatestIngestId } from "../db-helpers/getLatestIngestId";
import { getLessonsByState } from "../db-helpers/getLessonsByState";
import { Step, getPrevStep } from "../db-helpers/step";
import { updateLessonsState } from "../db-helpers/updateLessonsState";

const step: Step = "captions_fetch";
const prevStep = getPrevStep(step);

/**
 * This function fetches and stores captions for the lessons imported in the most recent ingest.
 * @todo allow ingestId to be passed in as an argument
 */
export async function captions({
  prisma,
}: {
  prisma: PrismaClientWithAccelerate;
}) {
  const ingestId = await getLatestIngestId({ prisma });
  /**
   * Get all raw lessons which are ready for transcripts
   */
  const lessons = await getLessonsByState({
    prisma,
    ingestId,
    step: prevStep,
    stepStatus: "completed",
  });

  /**
   * Update status to fetching
   */
  await updateLessonsState({
    prisma,
    ingestId,
    lessonIds: lessons.map((l) => l.id),
    step,
    stepStatus: "started",
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
      const { caption: data } = await getCaptionsByFileName(fileName);

      await createCaptionsRecord({
        prisma,
        ingestId: lesson.ingestId,
        lessonId: lesson.id,
        captions: data,
      });
      await updateLessonsState({
        prisma,
        ingestId,
        lessonIds: [lesson.id],
        step,
        stepStatus: "completed",
      });
      completedLessonIds.push(lesson.id);
    } catch (cause) {
      const error = new IngestError("Failed to fetch captions", {
        cause,
      });
      failedLessonIds.push(lesson.id);
      await createErrorRecord({
        prisma,
        ingestId,
        lessonId: lesson.id,
        step,
        errorMessage: error.message,
      });
      await updateLessonsState({
        prisma,
        ingestId,
        lessonIds: [lesson.id],
        step,
        stepStatus: "failed",
      });
    }
  }

  console.log(`Failed: ${failedLessonIds.length} lessons`);
  console.log(`Completed: ${completedLessonIds.length} lessons`);
}

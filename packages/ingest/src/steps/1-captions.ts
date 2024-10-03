import { PrismaClientWithAccelerate, prisma } from "@oakai/db";

import { IngestError } from "../IngestError";
import { getCaptionsByFileName } from "../captions/getCaptionsByFileName";
import { getCaptionsFileNameForLesson } from "../captions/getCaptionsFileNameForLesson";
import {
  Step,
  createCaptionsRecord,
  createErrorRecord,
  getLatestIngestId,
  getLessonsByState,
  updateLessonsState,
} from "./helpers";

captions({ prisma });

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
    step: "import",
    stepStatus: "completed",
  });

  console.log(`Fetching captions for ${lessons.length} lessons`);

  const step: Step = "captions_fetch";

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

  /**
   * Fetch transcript for each lesson
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
    } catch (cause) {
      const error = new IngestError("Failed to fetch captions", {
        cause,
      });
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
}

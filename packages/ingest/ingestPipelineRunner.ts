import { prisma } from "@oakai/db";
import { z } from "zod";

import {
  getCaptionsByFileName,
  getCaptionsFileNameForLesson,
} from "./transcripts/getCaptionsByFileName";

/**
 * This function checks for active ingest pipelines, and within them
 * checks for ready steps, and runs them.
 */
async function ingestPipelineRunner() {
  console.log("running ingest pipeline");
  /**
   * Get all active ingest pipelines
   */
  const activeIngests = await prisma.ingest.findMany({
    where: {
      status: "active",
    },
  });
  const ingestIds = activeIngests.map((ing) => ing.id);

  /**
   * Get all raw lessons which are ready for transcripts
   */
  const lessonsWhichNeedTranscripts = await prisma.ingestRawLesson.findMany({
    where: {
      ingestId: {
        in: ingestIds,
      },
      transcriptId: {
        not: null,
      },
      status: "should_fetch_transcript",
    },
  });

  /**
   * Update status
   */
  await prisma.ingestRawLesson.updateMany({
    where: {
      id: {
        in: lessonsWhichNeedTranscripts.map((l) => l.id),
      },
    },
    data: {
      status: "fetching_trancript",
    },
  });

  /**
   * Fetch transcript for each lesson
   */
  for (const lesson of lessonsWhichNeedTranscripts) {
    const parseResult = z
      .object({ videoTitle: z.string() })
      .safeParse(lesson.data);
    if (!parseResult.success) {
      // record error
      await prisma.ingestError.create({
        data: {
          ingestId: lesson.ingestId,
          recordType: "lesson",
          recordId: lesson.id,
          stage: "fetching_transcript",
          errorMessage: "lesson data is missing",
        },
      });
      await prisma.ingestRawLesson.update({
        where: {
          id: lesson.id,
        },
        data: {
          status: "error",
        },
      });

      continue;
    }

    const fileName = getCaptionsFileNameForLesson(parseResult.data);
    // fetch transcript
    const transcript = await getCaptionsByFileName(fileName);
    // save transcript
    const transcriptRecord = await prisma.ingestLessonTranscript.create({
      data: {
        ingestId: lesson.ingestId,
        lessonId: lesson.id,
        data: transcript,
        status: "fetched",
      },
    });
    // update status
    await prisma.ingestRawLesson.update({
      where: {
        id: lesson.id,
      },
      data: {
        transcriptId: transcriptRecord.id,
        status: "should_generate_lesson_plan",
      },
    });
  }

  /**
   * Get all lessons which are ready for lesson plan generation, and write request batch
   */
  const lessonsWhichNeedLessonPlans = await prisma.ingestRawLesson.findMany({
    where: {
      ingestId: {
        in: ingestIds,
      },
      status: "should_generate_lesson_plan",
    },
    include: {
      transcript: true,
    },
  });
}

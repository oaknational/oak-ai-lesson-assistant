import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import { z } from "zod";

import { getCaptionsFromFile } from "../../utils/getCaptionsFromFile";

const log = aiLogger("core");

const newLessonContentSchema = z
  .object({
    videoTitle: z.string(),
  })
  .passthrough();

const main = async () => {
  try {
    log.info("Starting");

    const newLessons = await prisma.lesson.findMany({
      where: {
        isNewLesson: true,
      },
    });

    let numberOfProcessedLessons = 0;

    await Promise.all(
      newLessons.map(async (lesson) => {
        const lessonId = lesson?.id;
        const parsedLesson = newLessonContentSchema.parse(
          lesson?.newLessonContent,
        );
        numberOfProcessedLessons++;
        /*
         *  Use function from OWA to capture transcripts from GCP based on video title
         */
        await getTranscriptForVideoTitle(parsedLesson?.videoTitle).then(
          async (transcriptAndCaption) => {
            log.info("lesson", lesson?.slug);
            const content = {
              ...parsedLesson,

              transcriptSentences: transcriptAndCaption?.transcript?.join(" "),
            };
            log.info(transcriptAndCaption?.transcript && "Transcript loaded ");
            log.info(transcriptAndCaption?.caption && "Caption loaded ");
            /*
             *  Update newLessonContent with transcript
             */
            if (typeof lessonId === "string") {
              await updateNewLessonContent(lessonId, content);
              await updateCaptions(lessonId, transcriptAndCaption?.caption);
            }
          },
        );
      }),
    );
    log.info("Script finished successfully");
    log.info("Processed lessons: ", numberOfProcessedLessons);
  } catch (e) {
    log.error(e);
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    log.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

async function updateNewLessonContent(
  lessonId: string,
  content: {
    transcriptSentences: string | undefined;
    videoTitle: string;
  },
) {
  await prisma.lesson.update({
    where: {
      id: lessonId,
    },
    data: {
      newLessonContent: content,
    },
  });
}

async function updateCaptions(
  lessonId: string,
  captions:
    | {
        end: number;
        part?: string;
        text?: string;
        start: number;
      }[]
    | undefined,
) {
  await prisma.lesson.update({
    where: {
      id: lessonId,
    },
    data: {
      captions,
    },
  });
}

async function getTranscriptForVideoTitle(videoTitle: string) {
  const fileName = `${videoTitle}.vtt`;
  const transcriptAndCaption = getCaptionsFromFile(fileName);
  return transcriptAndCaption;
}

export {};

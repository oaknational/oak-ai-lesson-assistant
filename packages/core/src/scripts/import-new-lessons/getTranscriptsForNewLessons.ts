import { prisma } from "@oakai/db";
import { z } from "zod";

import { getCaptionsFromFile } from "../../utils/getCaptionsFromFile";

const newLessonContentSchema = z
  .object({
    videoTitle: z.string(),
  })
  .passthrough();

const main = async () => {
  try {
    console.log("Starting");

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
          (transcriptAndCaption) => {
            console.log("lesson", lesson?.slug);
            const content = {
              ...parsedLesson,

              transcriptSentences: transcriptAndCaption?.transcript?.join(" "),
            };
            console.log(
              transcriptAndCaption?.transcript && "Transcript loaded ",
            );
            console.log(transcriptAndCaption?.caption && "Caption loaded ");
            /*
             *  Update newLessonContent with transcript
             */
            if (typeof lessonId === "string") {
              updateNewLessonContent(lessonId, content);
              updateCaptions(lessonId, transcriptAndCaption?.caption);
            }
          },
        );
      }),
    );
    console.log("Script finished successfully");
    console.log("Processed lessons: ", numberOfProcessedLessons);
  } catch (e) {
    console.error(e);
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
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

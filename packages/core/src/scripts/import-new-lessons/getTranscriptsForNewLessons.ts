import { prisma, type Lesson } from "@oakai/db";
import { aiLogger } from "@oakai/logger";
import { z } from "zod";

import { getCaptionsFromFile } from "../../utils/getCaptionsFromFile";

const log = aiLogger("core");
const newLessonContentSchema = z
  .object({
    videoTitle: z.string(),
  })
  .passthrough();

async function getTranscriptAndContent(lesson: Lesson) {
  const parsedLesson = newLessonContentSchema.parse(lesson?.newLessonContent);
  const transcriptAndCaption = await getTranscriptForVideoTitle(
    parsedLesson?.videoTitle,
  );

  return {
    content: {
      ...parsedLesson,
      transcriptSentences: transcriptAndCaption?.transcript?.join(" "),
    },
    transcriptAndCaption,
  };
}

async function updateLessonData(
  lessonId: string,
  content: ReturnType<typeof getTranscriptAndContent> extends Promise<infer T>
    ? T
    : never,
) {
  await Promise.all([
    updateNewLessonContent(lessonId, content.content),
    updateCaptions(lessonId, content.transcriptAndCaption?.caption),
  ]);
}

async function processLesson(lesson: Lesson) {
  const lessonId = lesson?.id;
  if (typeof lessonId !== "string") return false;

  const content = await getTranscriptAndContent(lesson);

  log.info("lesson", lesson?.slug);
  log.info(content.transcriptAndCaption?.transcript && "Transcript loaded ");
  log.info(content.transcriptAndCaption?.caption && "Caption loaded ");

  await updateLessonData(lessonId, content);
  return true;
}

const main = async () => {
  try {
    log.info("Starting");

    const newLessons = await prisma.lesson.findMany({
      where: { isNewLesson: true },
    });

    const results = await Promise.all(newLessons.map(processLesson));
    const numberOfProcessedLessons = results.filter(Boolean).length;

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

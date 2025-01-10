import type { Lesson, Snippet, SnippetVariant, Transcript } from "@oakai/db";
import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";
import { z } from "zod";

const log = aiLogger("core");

type LessonWithRelations = Lesson & {
  subject: { slug: string } | null;
  keyStage: { slug: string } | null;
};

const captionsSchema = z.array(
  z.object({
    end: z.number(),
    text: z.string(),
    start: z.number(),
  }),
);

const createSnippetsForLesson = async (
  lesson: LessonWithRelations,
  transcript: Transcript,
) => {
  const validCaptions = captionsSchema.parse(lesson.captions);

  return Promise.all(
    validCaptions.map(async (caption, index) => {
      const snippetAttributes = {
        sourceContent: caption.text,
        content: caption.text,
        index: index + 1,
        variant: "VTT" as SnippetVariant,
        lessonId: lesson.id,
        transcriptId: transcript.id,
        subjectId: lesson.subjectId,
        subjectSlug: lesson.subject?.slug,
        keyStageId: lesson.keyStageId,
        keyStageSlug: lesson.keyStage?.slug,
      };

      try {
        const snippet = await prisma.snippet.create({
          data: snippetAttributes,
        });
        log.info("Created snippet", snippet);
        return snippet;
      } catch (err) {
        log.error("Failed to create snippet", err);
        return null;
      }
    }),
  );
};

const main = async () => {
  try {
    log.info("Starting");

    const newLessons = await prisma.lesson.findMany({
      where: { isNewLesson: true },
      include: {
        transcripts: true,
        subject: true,
        keyStage: true,
      },
    });

    for (const lesson of newLessons) {
      const transcript = await prisma.transcript.findFirst({
        where: { lessonId: lesson.id },
      });

      if (!transcript) continue;

      try {
        await createSnippetsForLesson(lesson, transcript);
      } catch (err) {
        log.error(`Failed to process lesson ${lesson.slug}`, err);
      }
    }

    log.info("Script finished successfully");
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

export {};

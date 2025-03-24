import type { Snippet, SnippetVariant } from "@oakai/db";
import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import { z } from "zod";

const log = aiLogger("core");

const captionsSchema = z.array(
  z.object({
    end: z.number(),
    text: z.string(),
    start: z.number(),
  }),
);

const main = async () => {
  try {
    log.info("Starting");

    const newLessons = await prisma.lesson.findMany({
      where: {
        isNewLesson: true,
      },
      include: {
        transcripts: true,
        subject: true,
        keyStage: true,
      },
    });

    for (const lesson of newLessons) {
      const lessonId = lesson?.id;

      const transcript = await prisma.transcript.findFirst({
        where: {
          lessonId,
        },
      });
      log.info("transcriptId", transcript);
      log.info("lesson", lesson?.slug);
      let validCaptions: { end: number; text: string; start: number }[];
      try {
        log.info("lesson.captions", lesson.captions);
        validCaptions = captionsSchema.parse(lesson.captions);
      } catch (err) {
        log.error("Failed to parse captions", err);
        return transcript;
      }
      let index = 1;
      if (transcript) {
        for (const caption of validCaptions) {
          log.info("Creating snippet", caption);
          const snippetAttributes = {
            sourceContent: caption.text,
            content: caption.text,
            index,
            variant: "VTT" as SnippetVariant,
            lessonId: lesson.id,
            transcriptId: transcript.id,
            subjectId: lesson.subjectId,
            subjectSlug: lesson.subject?.slug,
            keyStageId: lesson.keyStageId,
            keyStageSlug: lesson.keyStage?.slug,
          };
          let snippet: Snippet | undefined;
          try {
            snippet = await prisma.snippet.create({
              data: snippetAttributes,
            });
          } catch (err) {
            log.error("Failed to create snippet", err);
          }
          log.info("Created snippet", snippet);
          index++;
        }
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

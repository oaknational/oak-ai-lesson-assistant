import type { Snippet, SnippetVariant } from "@oakai/db";
import { prisma } from "@oakai/db";
import { z } from "zod";

const captionsSchema = z.array(
  z.object({
    end: z.number(),
    text: z.string(),
    start: z.number(),
  }),
);

const main = async () => {
  try {
    console.log("Starting");

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

    newLessons.forEach(async (lesson) => {
      const lessonId = lesson?.id;

      const transcript = await prisma.transcript.findFirst({
        where: {
          lessonId,
        },
      });
      console.log("transcriptId", transcript);
      console.log("lesson", lesson?.slug);
      let validCaptions: { end: number; text: string; start: number }[];
      try {
        console.log("lesson.captions", lesson.captions);
        validCaptions = captionsSchema.parse(lesson.captions);
      } catch (err) {
        console.error("Failed to parse captions", err);
        return transcript;
      }
      let index = 1;
      if (transcript) {
        for (const caption of validCaptions) {
          console.log("Creating snippet", caption);
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
            console.error("Failed to create snippet", err);
          }
          console.log("Created snippet", snippet);
          index++;
        }
      }
    });

    console.log("Script finished successfully");
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

export {};

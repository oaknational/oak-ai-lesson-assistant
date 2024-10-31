import { prisma } from "@oakai/db";

import { inngest } from "../../inngest";

interface SimplifiedLesson {
  id: string;
}

export const embedSubjectLessonTranscripts = inngest.createFunction(
  {
    name: "Generate embeddings for all lessons transcripts for all lessons in a subject",
    id: "app-subject-transcripts-embed",
  },
  { event: "app/subject.transcripts.embed" },
  async ({ event, step }) => {
    const { subject: subjectSlug, keyStage: keyStageSlug } = event.data;

    const simplifiedLessons = await step.run(
      "Find all lessons in a subject",
      async () => {
        const keyStage = await prisma.keyStage.findFirstOrThrow({
          where: { slug: keyStageSlug },
        });
        const subject = await prisma.subject.findFirstOrThrow({
          where: { slug: subjectSlug },
        });
        const result = await prisma.lesson.findMany({
          where: {
            keyStageId: keyStage.id,
            subjectId: subject.id,
          },
        });
        const lessons: SimplifiedLesson[] = result.map((lesson) => {
          return {
            id: lesson.id,
          };
        });

        return lessons;
      },
    );

    await step.run("Loop over lessons and embed transcripts", async () => {
      for (const lesson of simplifiedLessons) {
        const transcript = await prisma.transcript.findFirst({
          where: { lessonId: lesson.id },
        });
        if (!transcript) {
          // TODO - create a transcript
          continue;
        }
        await step.sendEvent("embed-lesson-transcript", {
          name: "app/transcript.embed",
          data: { transcriptId: transcript.id },
        });
      }
    });
  },
);

import { prisma } from "@oakai/db";

import { inngest } from "../../client";

interface SimplifiedLesson {
  id: string;
  hasSummary: boolean;
}

export const summariseSubjectLessons = inngest.createFunction(
  {
    name: "Summarise all lessons in a subject/keystage pair",
    id: "app-subject-summarise",
  },
  { event: "app/subject.summarise" },
  async ({ event, step }) => {
    const { subject: subjectSlug, keyStage: keyStageSlug } = event.data;

    await step.run(
      "Find all lessons in a subject and summarise them if not already summarised",
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
          include: { summaries: true },
        });

        const lessons: SimplifiedLesson[] = result.map((lesson) => {
          return {
            id: lesson.id,
            hasSummary: lesson.summaries.length > 0,
          };
        });

        const lessonsWithNoSummary = lessons.filter((lesson) => {
          return !lesson.hasSummary;
        });

        for (const lesson of lessonsWithNoSummary) {
          await step.sendEvent("summarise-lesson", {
            name: "app/lesson.summarise",
            data: { lessonId: lesson.id },
          });
        }
        return { lessons };
      },
    );
  },
);

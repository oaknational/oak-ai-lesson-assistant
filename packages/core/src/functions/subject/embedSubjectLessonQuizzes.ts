import { prisma } from "@oakai/db";

import { inngest } from "../../client";

interface SimplifiedLesson {
  id: string;
}

export const embedSubjectLessonQuizzes = inngest.createFunction(
  {
    name: "Generate embeddings for all quizzes for all lessons in a subject",
    id: "app-subject-quizzes-embed",
  },
  { event: "app/subject.quizzes.embed" },
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

    await step.run("Loop over lessons and embed quizzes", async () => {
      for (const lesson of simplifiedLessons) {
        await step.sendEvent("embed-lesson-quiz", {
          name: "app/lesson.quiz.embed",
          data: { lessonId: lesson.id },
        });
      }
    });
  },
);

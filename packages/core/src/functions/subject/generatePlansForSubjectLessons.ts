import { prisma } from "@oakai/db";

import { inngest } from "../../client";

interface SimplifiedLesson {
  id: string;
  hasPlan: boolean;
}

export const generatePlansForSubjectLessons = inngest.createFunction(
  {
    name: "Generate lesson plans for all lessons in a subject/keystage pair",
    id: "app-subject-lesson-plans",
  },
  { event: "app/subject.lessonPlans" },
  async ({ event, step }) => {
    const { subject: subjectSlug, keyStage: keyStageSlug } = event.data;

    const lessonIDs = await step.run(
      "Find all lessons in a subject and generate plans for them if not already created",
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
          include: { lessonPlans: true },
        });

        const lessons: SimplifiedLesson[] = result.map((lesson) => {
          return {
            id: lesson.id,
            hasPlan: lesson.lessonPlans.length > 0,
          };
        });

        const lessonsWithNoPlan = lessons.filter((lesson) => {
          return !lesson.hasPlan;
        });

        // return { lessons };
        return lessonsWithNoPlan.map((lesson) => lesson.id);
      },
    );

    for (const lessonId of lessonIDs) {
      await step.sendEvent("plan-lesson", {
        name: "app/lesson.generatePlan",
        data: { lessonId },
      });
    }
  },
);

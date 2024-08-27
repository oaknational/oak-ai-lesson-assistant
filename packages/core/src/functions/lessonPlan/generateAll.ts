import { prisma } from "@oakai/db";

import { inngest } from "../../client";

export const generateAllLessonPlans = inngest.createFunction(
  {
    name: "Generate lesson plans for all lessons if they do not have them",
    id: "app-lesson-plan-generate-all",
  },
  { event: "app/lessonPlan.generateAll" },
  async ({ step }) => {
    const keyStagesAndSubjects = await step.run(
      "Get all lesson plans that are pending embedding",
      async () => {
        const keyStages = await prisma.keyStage.findMany({
          select: {
            slug: true,
          },
        });
        const keyStageSlugs = keyStages.map((keyStage) => keyStage.slug);

        const subjects = await prisma.subject.findMany({
          select: {
            slug: true,
          },
        });

        const subjectSlugs = subjects.map((subject) => subject.slug);

        return { subjectSlugs, keyStageSlugs };
      },
    );

    for (const keyStageSlug of keyStagesAndSubjects.keyStageSlugs) {
      for (const subjectSlug of keyStagesAndSubjects.subjectSlugs) {
        await step.sendEvent("plan-subject-lessons", {
          name: "app/subject.lessonPlans",
          data: { keyStage: keyStageSlug, subject: subjectSlug },
        });
      }
    }
  },
);

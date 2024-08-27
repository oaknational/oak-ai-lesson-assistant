import { LessonPlanPartStatus, prisma } from "@oakai/db";

import { inngest } from "../../client";
import { LessonPlans } from "../../models";

export const embedAllLessonPlanParts = inngest.createFunction(
  {
    name: "Generate embeddings for all lesson plan parts that do not have them",
    id: "app-lesson-plan-parts-embed-all",
  },
  { event: "app/lessonPlan.embedAllParts" },
  async ({ step }) => {
    const partIds = await step.run(
      "Get all lesson plan parts that are pending embedding",
      async () => {
        const lessonPlanParts = await prisma.lessonPlanPart.findMany({
          where: {
            status: LessonPlanPartStatus.PENDING,
          },
        });
        return lessonPlanParts.map((part) => part.id);
      },
    );

    for (const partId of partIds) {
      await step.run("Get OpenAI embeddings of the lesson plan", async () => {
        const part = await prisma.lessonPlanPart.findUniqueOrThrow({
          where: { id: partId },
        });
        const result = await new LessonPlans(prisma).embedPart(part);

        await prisma.lessonPlanPart.update({
          where: { id: partId },
          data: { status: LessonPlanPartStatus.SUCCESS, updatedAt: new Date() },
        });

        return {
          result,
        };
      });
    }
  },
);

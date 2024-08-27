import { LessonPlanStatus, prisma } from "@oakai/db";

import { inngest } from "../../client";
import { LessonPlans } from "../../models";

export const embedAllLessonPlans = inngest.createFunction(
  {
    name: "Generate embeddings for all lesson plans that do not have them",
    id: "app-lesson-plan-embed-all",
  },
  { event: "app/lessonPlan.embedAll" },
  async ({ step }) => {
    const planIds = await step.run(
      "Get all lesson plans that are pending embedding",
      async () => {
        const lessonPlans = await prisma.lessonPlan.findMany({
          where: {
            status: LessonPlanStatus.PENDING,
          },
        });
        return lessonPlans.map((plan) => plan.id);
      },
    );

    console.log("planIds", planIds);

    for (const planId of planIds) {
      await step.run("Get OpenAI embeddings of the lesson plan", async () => {
        const result = await new LessonPlans(prisma).embed(planId);

        await prisma.lessonPlan.update({
          where: { id: planId },
          data: { status: LessonPlanStatus.SUCCESS, updatedAt: new Date() },
        });

        return {
          result,
        };
      });
    }
  },
);

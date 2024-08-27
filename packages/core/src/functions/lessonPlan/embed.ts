import { LessonPlanStatus, prisma } from "@oakai/db";

import { inngest } from "../../client";
import { LessonPlans } from "../../models";

export const embedLessonPlan = inngest.createFunction(
  {
    name: "Generate embeddings for a lesson plan",
    id: "app-lesson-plan-embed",
  },
  { event: "app/lessonPlan.embed" },
  async ({ event, step }) => {
    const { lessonPlanId } = event.data;

    await step.run("Get OpenAI embeddings of the lesson plan", async () => {
      const result = await new LessonPlans(prisma).embed(lessonPlanId);

      await prisma.lessonPlan.update({
        where: { id: lessonPlanId },
        data: { status: LessonPlanStatus.SUCCESS, updatedAt: new Date() },
      });

      return {
        result,
      };
    });
  },
);

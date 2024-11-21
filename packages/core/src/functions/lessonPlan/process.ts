import { prisma } from "@oakai/db";

import { inngest } from "../../inngest";
import { LessonPlans } from "../../models";

export const processLessonPlan = inngest.createFunction(
  {
    name: "Generate content for a lesson plan",
    id: "app-lesson-plan-process",
  },
  { event: "app/lessonPlan.process" },
  async ({ event, step }) => {
    const { lessonPlanId } = event.data;

    await step.run("Generate content for a lesson plan", async () => {
      const result = await new LessonPlans(prisma).process(lessonPlanId);

      return {
        result,
      };
    });
  },
);

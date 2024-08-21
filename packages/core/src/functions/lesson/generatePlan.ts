import { prisma } from "@oakai/db";

import { inngest } from "../../client";
import { LessonPlans } from "../../models";

export const generatePlanForLesson = inngest.createFunction(
  {
    name: "Generate a lesson plan based a lesson and store it in the database",
    id: "app-lesson-plan",
  },
  { event: "app/lesson.generatePlan" },
  async ({ event, step }) => {
    const { lessonId } = event.data;

    await step.run("Create a plan for a lesson", async () => {
      const result = await new LessonPlans(prisma).createFromLesson(lessonId);
      console.log("result", result);
      return result?.id;
    });
  },
);

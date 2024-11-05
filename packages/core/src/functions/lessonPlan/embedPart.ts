import { LessonPlanPartStatus, prisma } from "@oakai/db";

import { inngest } from "../../inngest";
import { LessonPlans } from "../../models";

export const embedLessonPlanPart = inngest.createFunction(
  {
    name: "Generate embeddings for a lesson plan part",
    id: "app-lesson-plan-part-embed",
  },
  { event: "app/lessonPlan.embedPart" },
  async ({ event, step }) => {
    const { lessonPlanPartId } = event.data;

    await step.run("Get OpenAI embeddings of the lesson plan", async () => {
      const part = await prisma.lessonPlanPart.findUniqueOrThrow({
        where: { id: lessonPlanPartId },
      });
      const result = await new LessonPlans(prisma).embedPart(part);

      await prisma.lessonPlanPart.update({
        where: { id: lessonPlanPartId },
        data: { status: LessonPlanPartStatus.SUCCESS, updatedAt: new Date() },
      });

      return {
        result,
      };
    });
  },
);

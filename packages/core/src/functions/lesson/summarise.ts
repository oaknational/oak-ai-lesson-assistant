import { LessonSummaryStatus, prisma } from "@oakai/db";

import { inngest } from "../../client";
import { Lessons } from "../../models";

export const summariseLesson = inngest.createFunction(
  {
    name: "Generate a summary of a lesson and store it in the database",
    id: "app-lesson-summarise",
  },
  { event: "app/lesson.summarise" },
  async ({ event, step }) => {
    const { lessonId } = event.data;

    const createdLessonSummaryId = await step.run(
      "Get an OpenAI summarisation for a lesson",
      async () => {
        const result = await new Lessons(prisma).summarise(lessonId);
        console.log("result", result);
        return result?.id;
      },
    );

    if (!createdLessonSummaryId) {
      throw new Error("No lesson summary created");
    }

    await step.run(
      "Update status to GENERATED and schedule embedding",
      async () => {
        await prisma.lessonSummary.update({
          where: { id: createdLessonSummaryId },
          data: {
            status: LessonSummaryStatus.GENERATED,
            updatedAt: new Date(),
          },
        });

        await step.sendEvent("embed-lesson-summary", {
          name: "app/lessonSummary.embed",
          data: { lessonSummaryId: createdLessonSummaryId },
        });
      },
    );
  },
);

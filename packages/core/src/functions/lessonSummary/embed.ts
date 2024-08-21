import { LessonSummaryStatus, prisma } from "@oakai/db";

import { inngest } from "../../client";
import { LessonSummaries } from "../../models";

export const embedLessonSummary = inngest.createFunction(
  {
    name: "Generate embeddings for a lesson summary",
    id: "app-lesson-summary-embed",
  },
  { event: "app/lessonSummary.embed" },
  async ({ event, step }) => {
    const { lessonSummaryId } = event.data;

    await step.run("Get OpenAI embeddings of the summary", async () => {
      const result = await new LessonSummaries(prisma).embed(lessonSummaryId);

      await prisma.lessonSummary.update({
        where: { id: lessonSummaryId },
        data: { status: LessonSummaryStatus.SUCCESS, updatedAt: new Date() },
      });

      return {
        result,
      };
    });
  },
);

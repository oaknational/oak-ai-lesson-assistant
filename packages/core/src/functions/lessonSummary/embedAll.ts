import { prisma } from "@oakai/db";

import { inngest } from "../../client";
import { LessonSummaries } from "../../models";

export const embedAllLessonSummaries = inngest.createFunction(
  {
    name: "Generate embeddings for all lesson summaries that do not have them",
    id: "app-lesson-summary-embed-all",
  },
  { event: "app/lessonSummary.embedAll" },
  async ({ step }) => {
    await step.run("Schedule embedding all lesson summaries", async () => {
      const result = await new LessonSummaries(prisma).embedAll();
      return {
        result,
      };
    });
  },
);

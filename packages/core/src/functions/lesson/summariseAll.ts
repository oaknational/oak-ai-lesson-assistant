import { prisma } from "@oakai/db";

import { inngest } from "../../inngest";
import { Lessons } from "../../models";

export const summariseAllLessons = inngest.createFunction(
  {
    name: "Generate summaries for all lessons",
    id: "app-lesson-summarise-all",
  },
  { event: "app/lesson.summariseAll" },
  async ({ step }) => {
    await step.run("Schedule generation all lesson summaries", async () => {
      const result = await new Lessons(prisma).summariseAll();
      return {
        result,
      };
    });
  },
);

import { prisma } from "@oakai/db";

import { inngest } from "../../client";
import { Statistics } from "../../models/statistics";

export const recalculateStatistics = inngest.createFunction(
  {
    name: "Batch re-generate statistics",
    retries: 0,
    id: "app-statistics-recalculate",
  },
  {
    cron: "*/30 * * * *",
  },
  async ({ step }) => {
    const stats = new Statistics(prisma);

    await step.run("Calculate generation averages", async () => {
      await stats.updateMedianGenerationTotalDurations();
      await stats.updateMeanGenerationTotalDurations();
      await stats.updateMedianGenerationLlmDurations();
      await stats.updateMeanGenerationLlmDurations();
    });
  },
);

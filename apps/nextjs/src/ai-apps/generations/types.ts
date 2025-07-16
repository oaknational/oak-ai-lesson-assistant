import { z } from "zod";

import { lessonPlannerStateSchema } from "@/ai-apps/lesson-planner/state/types";

export const outputSchema = lessonPlannerStateSchema.omit({
  rateLimit: true,
  sessionId: true,
});

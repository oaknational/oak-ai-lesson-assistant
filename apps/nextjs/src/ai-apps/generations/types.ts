import { z } from "zod";

import { lessonPlannerStateSchema } from "@/ai-apps/lesson-planner/state/types";
import { quizAppStateSchema } from "@/ai-apps/quiz-designer/state/types";

export const outputSchema = z.union([
  lessonPlannerStateSchema.omit({
    rateLimit: true,
    sessionId: true,
  }),
  quizAppStateSchema.omit({
    rateLimit: true,
    sessionId: true,
  }),
]);

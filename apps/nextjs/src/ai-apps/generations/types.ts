import { lessonPlannerStateSchema } from "ai-apps/lesson-planner/state/types";
import { quizAppStateSchema } from "ai-apps/quiz-designer/state/types";
import { z } from "zod";

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

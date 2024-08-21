import { OakPromptDefinition } from "../../types";
import { inputSchema } from "./input.schema";
import { outputSchema } from "./output.schema";
import * as main from "./variants/main";

const extendLessonPlanQuiz: OakPromptDefinition = {
  appId: "lesson-planner",
  name: "Extend lesson plan quiz",
  slug: "extend-lesson-plan-quiz",
  variants: [{ slug: "main", parts: main }],
  inputSchema,
  outputSchema,
};

export { extendLessonPlanQuiz };

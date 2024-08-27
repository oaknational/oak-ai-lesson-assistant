import { OakPromptDefinition } from "../../types";
import { inputSchema } from "./input.schema";
import { outputSchema } from "./output.schema";
import * as main from "./variants/main";

const regenerateLessonPlan: OakPromptDefinition = {
  appId: "lesson-planner",
  name: "Regenerate lesson plan",
  slug: "regenerate-lesson-plan",
  variants: [{ slug: "main", parts: main }],
  inputSchema,
  outputSchema,
};

export { regenerateLessonPlan };

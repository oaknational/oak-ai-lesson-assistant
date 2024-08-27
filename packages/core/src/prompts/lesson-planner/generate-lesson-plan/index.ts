import { OakPromptDefinition } from "../../types";
import { inputSchema } from "./input.schema";
import { outputSchema } from "./output.schema";
import main from "./variants/main";

const generateLessonPlan: OakPromptDefinition = {
  appId: "lesson-planner",
  name: "Generate lesson plan",
  slug: "generate-lesson-plan",
  variants: [{ slug: "main", parts: main }],
  inputSchema,
  outputSchema,
};

export { generateLessonPlan };

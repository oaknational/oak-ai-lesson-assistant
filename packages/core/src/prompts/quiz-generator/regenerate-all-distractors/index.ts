import { OakPromptDefinition } from "../../types";
import { inputSchema } from "./input.schema";
import { outputSchema } from "./output.schema";
import * as main from "./variants/main";

export const regenerateAllDistractors: OakPromptDefinition = {
  appId: "quiz-generator",
  name: "Regenerate all distractors",
  slug: "regenerate-all-distractors-rag",
  variants: [{ slug: "main", parts: main }],
  inputSchema,
  outputSchema,
};

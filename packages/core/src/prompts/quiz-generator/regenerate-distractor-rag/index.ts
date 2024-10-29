import type { OakPromptDefinition } from "../../types";
import { inputSchema } from "./input.schema";
import { outputSchema } from "./output.schema";
import * as main from "./variants/main";

export const regenerateDistractor: OakPromptDefinition = {
  appId: "quiz-generator",
  name: "Regenerate distractor",
  slug: "regenerate-distractor-rag",
  variants: [{ slug: "main", parts: main }],
  inputSchema,
  outputSchema,
};

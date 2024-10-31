import type { OakPromptDefinition } from "../../types";
import { inputSchema } from "./input.schema";
import { outputSchema } from "./output.schema";
import * as main from "./variants/main";

export const regenerateAnswer: OakPromptDefinition = {
  appId: "quiz-generator",
  name: "Regenerate answer",
  slug: "regenerate-answer-rag",
  variants: [{ slug: "main", parts: main }],
  inputSchema,
  outputSchema,
};

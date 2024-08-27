import { OakPromptDefinition } from "../../types";
import { inputSchema } from "./input.schema";
import { outputSchema } from "./output.schema";
import * as main from "./variants/main";

export const generateAnswersAndDistractorsRag: OakPromptDefinition = {
  appId: "quiz-generator",
  name: "Generate answers and distractors",
  slug: "generate-answers-and-distractors-rag",
  variants: [{ slug: "main", parts: main }],
  inputSchema,
  outputSchema,
};

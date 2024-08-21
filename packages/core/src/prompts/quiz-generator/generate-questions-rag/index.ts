import { OakPromptDefinition } from "../../types";
import { inputSchema } from "./input.schema";
import { outputSchema } from "./output.schema";
import * as main from "./variants/main";

export const generateQuestionsRag: OakPromptDefinition = {
  appId: "quiz-generator",
  name: "Generate Questions",
  slug: "generate-questions-rag",
  variants: [{ slug: "main", parts: main }],
  inputSchema,
  outputSchema,
};

import type { ZodSchema } from "zod";

import type { LooseLessonPlan } from "../../aila/src/protocol/schema";
import {
  additionalComprehensionPrompt,
  additionalComprehensionSystemPrompt,
  additionalHomeworkPrompt,
  additionalHomeworkSystemPrompt,
  additionalSciencePracticalActivityPrompt,
  additionalSciencePracticalActivitySystemPrompt,
} from "./prompts/additionalMaterialsPrompts";
import { isValidSchemaKey, schemaMap } from "./schemas";

export function getSchema(action: string): ZodSchema {
  const isValidKey = isValidSchemaKey(action);
  const schema = isValidKey ? schemaMap[action] : null;
  if (!schema) {
    throw new Error(`No schema found for action: ${action}`);
  }
  return schema;
}

export const getPrompt = (
  lessonPlan: LooseLessonPlan,
  action: string,
  previousOutput?: object | null,
  message?: string | null,
  transcript?: string,
) => {
  switch (action) {
    case "additional-homework":
      return {
        prompt: additionalHomeworkPrompt(lessonPlan, previousOutput, message),
        systemMessage: additionalHomeworkSystemPrompt(),
      };

    case "additional-comprehension":
      return {
        prompt: additionalComprehensionPrompt(
          lessonPlan,
          previousOutput,
          message,
        ),
        systemMessage: additionalComprehensionSystemPrompt(),
      };
    case "additional-science-practical-activity":
      return {
        prompt: additionalSciencePracticalActivityPrompt(
          lessonPlan,
          previousOutput,
          message,
          transcript,
        ),
        systemMessage: additionalSciencePracticalActivitySystemPrompt(),
      };

    default:
      throw new Error(`Action "${action}" is not supported.`);
  }
};

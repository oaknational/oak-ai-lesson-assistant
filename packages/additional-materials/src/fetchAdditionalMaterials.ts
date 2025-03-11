import { openai } from "@ai-sdk/openai";
import { generateObject, generateText, type CoreMessage } from "ai";
import type { ZodSchema } from "zod";

import type { LooseLessonPlan } from "../../aila/src/protocol/schema";
import {
  additionalComprehensionPrompt,
  additionalComprehensionSystemPrompt,
  additionalHomeworkPrompt,
  additionalHomeworkSystemPrompt,
  additionalSciencePracticalActivityPrompt,
  additionalSciencePracticalActivitySystemPrompt,
} from "./prompts/prompt";
import { schemaMap, type SchemaMapType } from "./schemas";

function getSchema(action: SchemaMapType): ZodSchema {
  const schema = schemaMap[action];
  if (!schema) {
    throw new Error(`No schema found for action: ${action}`);
  }
  return schema;
}

export const getPrompt = (
  lessonPlan: LooseLessonPlan,
  action: string,
  previousOutput?: Object | null,
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

export const fetchAdditionalMaterials = async ({
  lessonPlan,
  message,
  action,
  previousOutput,
  transcript,
}: {
  lessonPlan: LooseLessonPlan;
  message?: string | null;
  action: SchemaMapType;
  previousOutput?: Object | null;
  transcript?: string;
}) => {
  const generateObjectPrompt = getPrompt(
    lessonPlan,
    action,
    previousOutput,
    message,
    transcript,
  );

  const { object } = await generateObject({
    prompt: generateObjectPrompt.prompt,
    schema: getSchema(action),
    model: openai("gpt-4-turbo"),
    system: generateObjectPrompt.systemMessage,
  });

  return object;
};

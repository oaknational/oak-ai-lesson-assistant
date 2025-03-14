import { aiLogger } from "@oakai/logger";

import { openai } from "@ai-sdk/openai";
import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
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
import {
  type AdditionalMaterialType,
  isValidSchemaKey,
  schemaMap,
} from "./schemas";

const log = aiLogger("additional-materials");

function getSchema(action: string): ZodSchema {
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

export const fetchAdditionalMaterial = async ({
  lessonPlan,
  message,
  action,
  previousOutput,
  transcript,
}: {
  lessonPlan: LooseLessonPlan;
  message?: string;
  action: string;
  previousOutput?: object | null;
  transcript?: string;
}): Promise<AdditionalMaterialType> => {
  const passedAction = isValidSchemaKey(action) ? action : undefined;

  log.info("fetching additional materials", action);

  if (!passedAction) {
    throw new Error(`Action "${action}" is not supported.`);
  }

  const generateObjectPrompt = getPrompt(
    lessonPlan,
    action,
    previousOutput,
    message,
    transcript,
  );
  try {
    const { object } = await generateObject({
      prompt: generateObjectPrompt.prompt,
      schema: getSchema(action),
      model: openai("gpt-4-turbo"),
      system: generateObjectPrompt.systemMessage,
    });

    return schemaMap[passedAction].parse(object);
  } catch (error) {
    log.error(
      `Error generating additional materials for action: ${action}`,
      error,
    );
    Sentry.captureException(error);
    throw new Error(
      `Failed to generate additional materials for action: ${action}`,
    );
  }
};

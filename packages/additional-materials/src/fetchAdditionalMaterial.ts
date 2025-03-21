import { aiLogger } from "@oakai/logger";

import { openai } from "@ai-sdk/openai";
import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import { getPrompt, getSchema } from "helpers";

import type { LooseLessonPlan } from "../../aila/src/protocol/schema";
import {
  type AdditionalMaterialType,
  isValidSchemaKey,
  schemaMap,
} from "./schemas";

const log = aiLogger("additional-materials");

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

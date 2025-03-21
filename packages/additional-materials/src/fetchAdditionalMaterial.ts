import * as Sentry from "@sentry/nextjs";

import type { LooseLessonPlan } from "../../aila/src/protocol/schema";
import { type ProviderKey, providers } from "./aiProviders";
import { actionRegistry } from "./helpers";
import {
  type AdditionalMaterialType,
  isValidSchemaKey,
  schemaMap,
} from "./schemas";

export const fetchAdditionalMaterial = async ({
  lessonPlan,
  message,
  action,
  previousOutput,
  transcript,
  provider = "openai",
}: {
  lessonPlan: LooseLessonPlan;
  message?: string;
  action: string;
  previousOutput?: object | null;
  transcript?: string;
  provider?: ProviderKey;
}): Promise<AdditionalMaterialType> => {
  const passedAction = isValidSchemaKey(action) ? action : undefined;
  if (!passedAction) {
    throw new Error(`Unsupported action: ${action}`);
  }

  const metadata = actionRegistry[passedAction];
  const model = providers[provider];

  if (!metadata) {
    throw new Error(`Action config not found: ${action}`);
  }
  if (!model) {
    throw new Error(`AI provider "${provider}" is not supported.`);
  }

  try {
    const { prompt, systemMessage } = metadata.getPrompt({
      lessonPlan,
      previousOutput,
      message,
      transcript,
    });

    const object = await model.generateObject<AdditionalMaterialType>({
      prompt,
      schema: metadata.schema,
      systemMessage,
    });

    const passedResult = schemaMap[passedAction].parse(object);

    return passedResult;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error(
      `Failed to generate additional materials for action: ${action}`,
    );
  }
};

import { aiLogger } from "@oakai/logger";

import { ZodError, type ZodType } from "zod";

import { type ProviderKey, providers } from ".";

const log = aiLogger("additional-materials");

export const getLLMGeneration = async <T>(
  document: { prompt: string; systemMessage: string; schema: ZodType<T> },
  provider: ProviderKey,
) => {
  const model = providers[provider];

  if (!model) {
    throw new Error(`AI provider is not supported.`);
  }
  try {
    const validatedDocumentObject = await model.generateObject<T>({
      ...document,
    });

    return validatedDocumentObject;
  } catch (error) {
    log.error("Error in getLLMGeneration", error);
    if (error instanceof ZodError) {
      throw new Error(
        `Context schema validation failed: ${JSON.stringify(error.issues, null, 2)}`,
      );
    }
    throw new Error(`Failed to generate : ${String(error)}`);
  }
};

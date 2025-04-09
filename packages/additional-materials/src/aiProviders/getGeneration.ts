import { serializeError } from "serialize-error";
import { ZodError, type ZodType } from "zod";

import { type ProviderKey, providers } from ".";

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
    const serialized = serializeError(error);
    if (error instanceof ZodError) {
      throw new Error(
        `Context schema validation failed: ${JSON.stringify(serialized)}`,
      );
    }
    throw new Error(`Failed to generate : ${JSON.stringify(serialized)}`);
  }
};

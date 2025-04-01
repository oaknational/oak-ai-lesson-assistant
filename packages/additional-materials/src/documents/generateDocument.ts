import * as Sentry from "@sentry/nextjs";

import { type ProviderKey, providers } from "../aiProviders";
import type { DocumentConfig } from "./documentConfig";

export const generateDocument = async <S, P>({
  documentType,
  context,
  provider = "openai",
  documentConfig,
}: {
  documentType: string;
  context: P;
  provider?: ProviderKey;
  documentConfig: DocumentConfig<P>;
}): Promise<S> => {
  const config = documentConfig[documentType];
  if (!config) {
    throw new Error(`Config not found for document type: ${documentType}`);
  }
  const model = providers[provider];
  const { getPrompt, schema } = config;

  if (!model) {
    throw new Error(`AI provider "${provider}" is not supported.`);
  }

  try {
    const { prompt, systemMessage } = getPrompt(context);

    const validatedDocumentObject = await model.generateObject<S>({
      prompt,
      schema,
      systemMessage,
    });

    return validatedDocumentObject;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error(
      `Failed to generate document of type: ${documentType}. Error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

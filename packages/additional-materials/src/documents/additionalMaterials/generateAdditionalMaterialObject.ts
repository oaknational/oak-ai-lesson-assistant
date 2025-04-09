import type { ProviderKey } from "../../aiProviders";
import { getLLMGeneration } from "../../aiProviders/getGeneration";
import {
  type Action,
  type AdditionalMaterialSchemas,
  type AdditionalMaterialType,
  type ContextByMaterialType,
  additionalMaterialsConfigMap,
} from "./configSchema";

export const generateAdditionalMaterialObject = async <
  T extends AdditionalMaterialType,
>({
  parsedInput,
  provider = "openai",
  action,
}: {
  provider?: ProviderKey;
  parsedInput: {
    documentType: T;
    context: ContextByMaterialType[T];
  };
  action: Action;
}): Promise<AdditionalMaterialSchemas> => {
  const { documentType, context } = parsedInput;
  const config = additionalMaterialsConfigMap[documentType];

  return await getLLMGeneration<AdditionalMaterialSchemas>(
    {
      prompt: config.buildPrompt(context, action),
      systemMessage: config.systemMessage(),
      schema: config.schema,
    },
    provider,
  );
};

import type { ProviderKey } from "../../aiProviders";
import { getLLMGeneration } from "../../aiProviders/getGeneration";
import {
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
}: {
  provider?: ProviderKey;
  parsedInput: {
    documentType: T;
    context: ContextByMaterialType[T];
  };
}): Promise<AdditionalMaterialSchemas> => {
  const { documentType, context } = parsedInput;
  const config = additionalMaterialsConfigMap[documentType];

  return await getLLMGeneration<AdditionalMaterialSchemas>(
    {
      prompt: config.buildPrompt(context),
      systemMessage: config.systemMessage(),
      schema: config.schema,
    },
    provider,
  );
};

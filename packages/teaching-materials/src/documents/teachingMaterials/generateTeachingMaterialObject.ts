import type { ProviderKey } from "../../aiProviders";
import { getLLMGeneration } from "../../aiProviders/getGeneration";
import {
  type ContextByMaterialType,
  type TeachingMaterialSchemas,
  type TeachingMaterialType,
  teachingMaterialsConfigMap,
} from "./configSchema";

export const generateTeachingMaterialObject = async <
  T extends TeachingMaterialType,
>({
  parsedInput,
  provider = "openai",
}: {
  provider?: ProviderKey;
  parsedInput: {
    documentType: T;
    context: ContextByMaterialType[T];
  };
}): Promise<TeachingMaterialSchemas> => {
  const { documentType, context } = parsedInput;
  const config = teachingMaterialsConfigMap[documentType];

  return await getLLMGeneration<TeachingMaterialSchemas>(
    {
      prompt: config.buildPrompt(context),
      systemMessage: config.systemMessage(),
      schema: config.schema,
    },
    provider,
  );
};

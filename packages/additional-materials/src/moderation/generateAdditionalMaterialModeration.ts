import { moderationResponseSchema } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import type { ProviderKey } from "../aiProviders";
import { getLLMGeneration } from "../aiProviders/getGeneration";
import { moderationPrompt } from "./moderationPrompt";

export const generateAdditionalMaterialModeration = async ({
  input,
  provider,
}: {
  input: string;
  provider: ProviderKey;
}) => {
  const moderation = await getLLMGeneration(
    {
      prompt: input,
      systemMessage: moderationPrompt,
      schema: moderationResponseSchema,
    },
    provider,
  );

  return moderation;
};

import {
  type ModerationResult,
  moderationResponseSchema,
} from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import type { ProviderKey } from "../aiProviders";
import { getLLMGeneration } from "../aiProviders/getGeneration";
import { moderationPrompt } from "./moderationPrompt";

export const generateAdditionalMaterialModeration = async ({
  input,
  provider,
}: {
  input: string;
  provider: ProviderKey;
}): Promise<ModerationResult> => {
  const moderationResponse = await getLLMGeneration(
    {
      prompt: input,
      systemMessage: moderationPrompt,
      schema: moderationResponseSchema,
    },
    provider,
  );

  // Transform the LLM response format to the internal ModerationResult format
  // LLM returns: { scores, justifications, flagged_categories }
  // Internal expects: { scores?, categories, justification? }
  const result: ModerationResult = {
    scores: moderationResponse.scores,
    categories: moderationResponse.flagged_categories,
    justification:
      Object.keys(moderationResponse.justifications).length > 0
        ? JSON.stringify(moderationResponse.justifications)
        : undefined,
  };

  return result;
};

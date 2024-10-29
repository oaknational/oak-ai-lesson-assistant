import type {
  GenerationPart,
  GenerationPartAIGenerated,
  GenerationPartUserTweaked} from "@oakai/core/src/types";
import {
  GenerationPartType
} from "@oakai/core/src/types";

export function createAIGeneratedPart<Value>(
  value: Value,
  generationId: string,
): GenerationPartAIGenerated<Value> {
  return {
    value,
    type: GenerationPartType.AIGenerated,
    lastGenerationId: generationId,
  };
}

export function createTweakPart<Value>(
  value: Value,
  previousPart: GenerationPart<Value>,
): GenerationPartUserTweaked<Value> {
  return {
    value,
    type: GenerationPartType.UserTweaked,
    // If it's a tweak, persist the original, otherwise
    // the original must be the ai generated previous value
    originalValue:
      previousPart.type === GenerationPartType.UserTweaked
        ? previousPart.originalValue
        : previousPart.value,
    lastGenerationId: previousPart.lastGenerationId as string,
  };
}

// Barrel export for slidesAgent submodules

export {
  type SlideField,
  type IntentConfig,
  SHARED_RULES,
  INTENT_CONFIGS,
  SUPPORTED_EDIT_TYPES,
} from "./intents";

export {
  generateSlidePlanInputSchema,
  type GenerateSlidePlanInput,
} from "./schemas";

export { filterSlideContent } from "./filtering";

export { validateAgentOutput } from "./validation";

export {
  DEFAULT_BATCH_SIZE,
  LLM_TIMEOUT_MS,
  callSlidesAgent,
  processInBatches,
  mergeBatchResults,
} from "./batching";

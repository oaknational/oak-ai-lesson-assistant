import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { createSectionAgent } from "../createSectionAgent";
import { learningCycleTitlesInstructions } from "./learningCycleOutcomes.instructions";
import { LearningCyclesSchema } from "./learningCycleOutcomes.schema";

export const learningCycleOutcomesAgent = createSectionAgent({
  responseSchema: LearningCyclesSchema,
  instructions: learningCycleTitlesInstructions,
  defaultVoice: "EXPERT_TEACHER",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

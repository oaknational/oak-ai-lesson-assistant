import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import {
  createSectionAgent,
  keyStageInstructions,
} from "../createSectionAgent";
import { learningCycleTitlesInstructions } from "./learningCycleOutcomes.instructions";
import { LearningCyclesSchema } from "./learningCycleOutcomes.schema";

export const learningCycleOutcomesAgent = createSectionAgent({
  responseSchema: LearningCyclesSchema,
  instructions: keyStageInstructions(learningCycleTitlesInstructions),
  defaultVoice: "EXPERT_TEACHER",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

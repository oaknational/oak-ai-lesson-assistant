import { stringListToText } from "../../../utils/stringListToText";
import { createSectionAgent } from "../createSectionAgent";
import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { learningCycleTitlesInstructions } from "./learningCycleOutcomes.instructions";
import { LearningCyclesSchema } from "./learningCycleOutcomes.schema";

export const learningCycleOutcomesAgent = createSectionAgent({
  responseSchema: LearningCyclesSchema,
  instructions: learningCycleTitlesInstructions,
  defaultVoice: "EXPERT_TEACHER",
  contentToString: stringListToText(),
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

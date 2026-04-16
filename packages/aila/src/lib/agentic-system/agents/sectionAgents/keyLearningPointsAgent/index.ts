import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { stringListToText } from "../../../utils/stringListToText";
import { createSectionAgent } from "../createSectionAgent";
import { keyLearningPointsInstructions } from "./keyLearningPoints.instructions";
import { KeyLearningPointsSchema } from "./keyLearningPoints.schema";

export const keyLearningPointsAgent = createSectionAgent({
  responseSchema: KeyLearningPointsSchema,
  instructions: keyLearningPointsInstructions,
  contentToString: stringListToText(),
  defaultVoice: "EXPERT_TEACHER",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

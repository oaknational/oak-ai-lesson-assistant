import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import {
  createSectionAgent,
  keyStageInstructions,
} from "../createSectionAgent";
import { learningOutcomeInstructions } from "./learningOutcome.instructions";
import { LearningOutcomeSchema } from "./learningOutcome.schema";

export const learningOutcomeAgent = createSectionAgent({
  responseSchema: LearningOutcomeSchema,
  instructions: keyStageInstructions(learningOutcomeInstructions),
  defaultVoice: "PUPIL",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

import { createSectionAgent } from "../createSectionAgent";
import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { keyStageInstructions } from "./keyStage.instructions";
import { keyStageSchema } from "./keyStage.schema";

export const keyStageAgent = createSectionAgent({
  responseSchema: keyStageSchema,
  instructions: keyStageInstructions,
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

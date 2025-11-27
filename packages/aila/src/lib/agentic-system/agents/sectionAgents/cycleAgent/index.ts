import { createSectionAgent } from "../createSectionAgent";
import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { cyclesInstructions } from "./cycle.instructions";
import { CycleSchema } from "./cycle.schema";

export const cycleAgent = createSectionAgent({
  responseSchema: CycleSchema,
  instructions: cyclesInstructions,
  defaultVoice: "EXPERT_TEACHER",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

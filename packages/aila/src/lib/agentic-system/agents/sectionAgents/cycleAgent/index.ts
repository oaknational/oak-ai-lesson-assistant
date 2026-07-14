import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { cycleTargetPromptPart } from "../../sharedPromptParts/cycleTarget.part";
import {
  createSectionAgent,
  keyStageInstructions,
} from "../createSectionAgent";
import { cyclesInstructions } from "./cycle.instructions";
import { CycleSchema } from "./cycle.schema";

export const cycleAgent = createSectionAgent({
  responseSchema: CycleSchema,
  instructions: keyStageInstructions(cyclesInstructions),
  extraInputFromCtx: (ctx) => {
    const promptPart = cycleTargetPromptPart(ctx);
    return promptPart ? [{ role: "developer", content: promptPart }] : [];
  },
  defaultVoice: "EXPERT_TEACHER",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

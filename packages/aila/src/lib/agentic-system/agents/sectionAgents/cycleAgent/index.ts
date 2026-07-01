import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { createSectionAgent } from "../createSectionAgent";
import { cyclesInstructions } from "./cycle.instructions";
import { CycleSchema } from "./cycle.schema";

export const cycleAgent = createSectionAgent({
  responseSchema: CycleSchema,
  instructions: (ctx) =>
    cyclesInstructions(ctx.currentTurn.document.keyStage ?? ""),
  defaultVoice: "EXPERT_TEACHER",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

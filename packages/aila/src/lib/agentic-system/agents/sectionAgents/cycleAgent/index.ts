import { createSectionAgent } from "../createSectionAgent";
import { cyclesInstructions } from "./cycle.instructions";
import { CycleSchema } from "./cycle.schema";

export const cycleAgent = createSectionAgent({
  responseSchema: CycleSchema,
  instructions: cyclesInstructions,
  defaultVoice: "EXPERT_TEACHER",
});

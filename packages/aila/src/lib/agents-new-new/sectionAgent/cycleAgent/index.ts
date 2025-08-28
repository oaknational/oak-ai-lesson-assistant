import { createSectionAgent } from "../createSectionAgent";
import { cyclesInstructions } from "./cycleInstructions";
import { CycleSchema } from "./cycleSchema";

export const cycleAgent = createSectionAgent({
  responseSchema: CycleSchema,
  instructions: cyclesInstructions,
  defaultVoice: "EXPERT_TEACHER",
});

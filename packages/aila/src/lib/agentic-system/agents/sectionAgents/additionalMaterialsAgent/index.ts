import { z } from "zod";

import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { createSectionAgent } from "../createSectionAgent";
import { additionalMaterialsInstructions } from "./additionalMaterials.instructions";

export const additionalMaterialsAgent = createSectionAgent({
  responseSchema: z.string(),
  instructions: additionalMaterialsInstructions,
  voices: ["EXPERT_TEACHER"],
  defaultVoice: "EXPERT_TEACHER",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

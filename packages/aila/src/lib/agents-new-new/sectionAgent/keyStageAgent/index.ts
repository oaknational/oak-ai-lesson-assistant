import { createSectionAgent } from "../createSectionAgent";
import { keyStageInstructions } from "./keyStageInstructions";
import { keyStageSchema } from "./keyStageSchema";

export const keyStageAgent = createSectionAgent({
  responseSchema: keyStageSchema,
  instructions: keyStageInstructions,
});

import { createSectionAgent } from "../createSectionAgent";
import { keyStageInstructions } from "./keyStageInstructions";
import { KeyStageSchema } from "./keyStageSchema";

export const keyStageAgent = createSectionAgent({
  responseSchema: KeyStageSchema,
  instructions: keyStageInstructions,
});

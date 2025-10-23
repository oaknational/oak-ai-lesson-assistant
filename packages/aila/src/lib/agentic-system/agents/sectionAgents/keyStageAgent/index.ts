import { createSectionAgent } from "../createSectionAgent";
import { keyStageInstructions } from "./keyStage.instructions";
import { keyStageSchema } from "./keyStage.schema";

export const keyStageAgent = createSectionAgent({
  responseSchema: keyStageSchema,
  instructions: keyStageInstructions,
});

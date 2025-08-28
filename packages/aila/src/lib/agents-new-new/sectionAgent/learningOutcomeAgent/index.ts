import { createSectionAgent } from "../createSectionAgent";
import { learningOutcomeInstructions } from "./learningOutcomeInstructions";
import { LearningOutcomeSchema } from "./learningOutcomeSchema";

export const learningOutcomeAgent = createSectionAgent({
  responseSchema: LearningOutcomeSchema,
  instructions: learningOutcomeInstructions,
  defaultVoice: "PUPIL",
});

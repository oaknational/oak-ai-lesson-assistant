import { createSectionAgent } from "../createSectionAgent";
import { learningOutcomeInstructions } from "./learningOutcome.instructions";
import { LearningOutcomeSchema } from "./learningOutcome.schema";

export const learningOutcomeAgent = createSectionAgent({
  responseSchema: LearningOutcomeSchema,
  instructions: learningOutcomeInstructions,
  defaultVoice: "PUPIL",
});

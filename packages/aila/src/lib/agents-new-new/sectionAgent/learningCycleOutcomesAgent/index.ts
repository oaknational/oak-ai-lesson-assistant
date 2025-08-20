import { createSectionAgent } from "../createSectionAgent";
import { learningCycleTitlesInstructions } from "../learningCycleOutcomesAgent/learningCycleOutcomesInstructions";
import { LearningCyclesSchema } from "./learningCycleOutcomesSchema";

export const learningCycleOutcomesAgent = createSectionAgent({
  responseSchema: LearningCyclesSchema,
  instructions: learningCycleTitlesInstructions,
});

import { stringListToText } from "../../utils/stringListToText";
import { createSectionAgent } from "../createSectionAgent";
import { keyLearningPointsInstructions } from "./keyLearningPointsInstructions";
import { KeyLearningPointsSchema } from "./keyLearningPointsSchema";

export const keyLearningPointsAgent = createSectionAgent({
  responseSchema: KeyLearningPointsSchema,
  instructions: keyLearningPointsInstructions,
  contentToString: stringListToText(),
});

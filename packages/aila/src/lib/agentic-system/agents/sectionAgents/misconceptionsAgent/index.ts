import { stringListToText } from "../../../utils/stringListToText";
import { createSectionAgent } from "../createSectionAgent";
import { misconceptionsInstructions } from "./misconceptions.instructions";
import { MisconceptionsSchema } from "./misconceptions.schema";

export const misconceptionsAgent = createSectionAgent({
  responseSchema: MisconceptionsSchema,
  instructions: misconceptionsInstructions,
  contentToString: stringListToText(
    (m) => `${m.misconception}: ${m.description}`,
  ),
  defaultVoice: "EXPERT_TEACHER",
});

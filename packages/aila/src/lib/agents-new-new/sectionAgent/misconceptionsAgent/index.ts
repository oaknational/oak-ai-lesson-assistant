import { stringListToText } from "../../utils/stringListToText";
import { createSectionAgent } from "../createSectionAgent";
import { misconceptionsInstructions } from "./misconceptionsInstructions";
import { MisconceptionsSchema } from "./misconceptionsSchema";

export const misconceptionsAgent = createSectionAgent({
  responseSchema: MisconceptionsSchema,
  instructions: misconceptionsInstructions,
  contentToString: stringListToText(
    (m) => `${m.misconception}: ${m.description}`,
  ),
});

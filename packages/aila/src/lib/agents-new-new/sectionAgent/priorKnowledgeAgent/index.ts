import { stringListToText } from "../..//utils/stringListToText";
import { createSectionAgent } from "../createSectionAgent";
import { priorKnowledgeInstructions } from "./priorKnowledgeInstructions";
import { PriorKnowledgeSchema } from "./priorKnowledgeSchema";

export const priorKnowledgeAgent = createSectionAgent({
  responseSchema: PriorKnowledgeSchema,
  instructions: priorKnowledgeInstructions,
  contentToString: stringListToText(),
});

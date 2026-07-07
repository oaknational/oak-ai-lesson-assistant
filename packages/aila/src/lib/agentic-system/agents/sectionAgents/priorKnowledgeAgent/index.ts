import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { stringListToText } from "../../../utils/stringListToText";
import { createSectionAgent } from "../createSectionAgent";
import { priorKnowledgeInstructions } from "./priorKnowledge.instructions";
import { PriorKnowledgeSchema } from "./priorKnowledge.schema";

export const priorKnowledgeAgent = createSectionAgent({
  responseSchema: PriorKnowledgeSchema,
  instructions: priorKnowledgeInstructions,
  contentToString: stringListToText(),
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

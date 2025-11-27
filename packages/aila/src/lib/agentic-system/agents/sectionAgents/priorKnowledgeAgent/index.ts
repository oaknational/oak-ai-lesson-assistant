import { stringListToText } from "../../../utils/stringListToText";
import { createSectionAgent } from "../createSectionAgent";
import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { priorKnowledgeInstructions } from "./priorKnowledge.instructions";
import { PriorKnowledgeSchema } from "./priorKnowledge.schema";

export const priorKnowledgeAgent = createSectionAgent({
  responseSchema: PriorKnowledgeSchema,
  instructions: priorKnowledgeInstructions,
  contentToString: stringListToText(),
  defaultVoice: "EXPERT_TEACHER",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

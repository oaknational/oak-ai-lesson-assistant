import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { priorKnowledgeTargetPromptPart } from "../../sharedPromptParts/priorKnowledgeTarget.part";
import {
  createSectionAgent,
  keyStageBuildModeInstructions,
} from "../createSectionAgent";
import {
  addOneQuizInstructions,
  rewriteOneQuizInstructions,
  starterQuizInstructions,
} from "./starterQuiz.instructions";
import { StarterQuizSchema } from "./starterQuiz.schema";
import { starterQuizDocumentForPrompt } from "./starterQuizDocumentView";

export const starterQuizAgent = createSectionAgent({
  responseSchema: StarterQuizSchema,
  instructions: keyStageBuildModeInstructions({
    fullRegen: starterQuizInstructions,
    addOne: addOneQuizInstructions,
    rewriteOne: rewriteOneQuizInstructions,
  }),
  extraInputFromCtx: (ctx) => [
    { role: "developer", content: priorKnowledgeTargetPromptPart(ctx) },
  ],
  documentForPrompt: starterQuizDocumentForPrompt,
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

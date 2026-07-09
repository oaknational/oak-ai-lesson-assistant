import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { deriveSectionBuildMode } from "../../../quizOperations/deriveSectionBuildMode";
import { priorKnowledgeTargetPromptPart } from "../../sharedPromptParts/priorKnowledgeTarget.part";
import { createSectionAgent } from "../createSectionAgent";
import {
  addOneQuizInstructions,
  rewriteOneQuizInstructions,
  starterQuizInstructions,
} from "./starterQuiz.instructions";
import { StarterQuizSchema } from "./starterQuiz.schema";
import { starterQuizDocumentForPrompt } from "./starterQuizDocumentView";

export const starterQuizAgent = createSectionAgent({
  responseSchema: StarterQuizSchema,
  instructions: (ctx) => {
    const keyStage = ctx.currentTurn.document.keyStage ?? "";
    const mode = deriveSectionBuildMode(ctx.currentTurn.currentStep);
    switch (mode.kind) {
      case "fullRegen":
        return starterQuizInstructions(keyStage);
      case "addOne":
        return addOneQuizInstructions(keyStage);
      case "rewriteOne":
        return rewriteOneQuizInstructions(mode.position, keyStage);
    }
  },
  extraInputFromCtx: (ctx) => [
    { role: "developer", content: priorKnowledgeTargetPromptPart(ctx) },
  ],
  documentForPrompt: starterQuizDocumentForPrompt,
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

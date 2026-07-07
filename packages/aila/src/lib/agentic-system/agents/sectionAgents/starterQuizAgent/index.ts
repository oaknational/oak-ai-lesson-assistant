import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { deriveQuizBuildMode } from "../../../quizOperations/deriveQuizBuildMode";
import { createSectionAgent } from "../createSectionAgent";
import {
  addOneQuizInstructions,
  rewriteOneQuizInstructions,
  starterQuizInstructions,
} from "./starterQuiz.instructions";
import { StarterQuizSchema } from "./starterQuiz.schema";

export const starterQuizAgent = createSectionAgent({
  responseSchema: StarterQuizSchema,
  instructions: (ctx) => {
    const mode = deriveQuizBuildMode(ctx.currentTurn.currentStep);
    const promptTemplateId = `starterQuiz--default:${mode.kind}`;
    const promptInputs = {
      buildMode: mode.kind,
      ...(mode.kind === "rewriteOne" ? { position: mode.position } : {}),
    };
    switch (mode.kind) {
      case "fullRegen":
        return {
          text: starterQuizInstructions,
          promptTemplateId,
          promptInputs,
        };
      case "addOne":
        return {
          text: addOneQuizInstructions,
          promptTemplateId,
          promptInputs,
        };
      case "rewriteOne":
        return {
          text: rewriteOneQuizInstructions(mode.position),
          promptTemplateId,
          promptInputs,
        };
    }
  },
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

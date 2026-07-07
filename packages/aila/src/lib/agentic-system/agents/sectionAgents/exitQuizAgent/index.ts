import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { deriveQuizBuildMode } from "../../../quizOperations/deriveQuizBuildMode";
import { createSectionAgent } from "../createSectionAgent";
import {
  addOneQuizInstructions,
  exitQuizInstructions,
  rewriteOneQuizInstructions,
} from "./exitQuiz.instructions";
import { ExitQuizSchema } from "./exitQuiz.schema";

export const exitQuizAgent = createSectionAgent({
  responseSchema: ExitQuizSchema,
  instructions: (ctx) => {
    const mode = deriveQuizBuildMode(ctx.currentTurn.currentStep);
    const promptTemplateId = `exitQuiz--default:${mode.kind}`;
    const promptInputs = {
      buildMode: mode.kind,
      ...(mode.kind === "rewriteOne" ? { position: mode.position } : {}),
    };
    switch (mode.kind) {
      case "fullRegen":
        return {
          text: exitQuizInstructions,
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

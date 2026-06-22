import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { deriveSectionBuildMode } from "../../../quizOperations/deriveSectionBuildMode";
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
    const mode = deriveSectionBuildMode(ctx.currentTurn.currentStep);
    switch (mode.kind) {
      case "fullRegen":
        return exitQuizInstructions;
      case "addOne":
        return addOneQuizInstructions;
      case "rewriteOne":
        return rewriteOneQuizInstructions(mode.position);
    }
  },
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

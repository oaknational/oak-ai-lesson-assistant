import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { deriveSectionBuildMode } from "../../../quizOperations/deriveSectionBuildMode";
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
    const mode = deriveSectionBuildMode(ctx.currentTurn.currentStep);
    switch (mode.kind) {
      case "fullRegen":
        return starterQuizInstructions;
      case "addOne":
        return addOneQuizInstructions;
      case "rewriteOne":
        return rewriteOneQuizInstructions(mode.position);
    }
  },
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

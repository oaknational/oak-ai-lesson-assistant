import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
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

export const starterQuizAgent = createSectionAgent({
  responseSchema: StarterQuizSchema,
  instructions: keyStageBuildModeInstructions({
    fullRegen: starterQuizInstructions,
    addOne: addOneQuizInstructions,
    rewriteOne: rewriteOneQuizInstructions,
  }),
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

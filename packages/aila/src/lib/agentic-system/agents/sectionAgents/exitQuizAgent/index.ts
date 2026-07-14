import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import {
  createSectionAgent,
  keyStageBuildModeInstructions,
} from "../createSectionAgent";
import {
  addOneQuizInstructions,
  exitQuizInstructions,
  rewriteOneQuizInstructions,
} from "./exitQuiz.instructions";
import { ExitQuizSchema } from "./exitQuiz.schema";

export const exitQuizAgent = createSectionAgent({
  responseSchema: ExitQuizSchema,
  instructions: keyStageBuildModeInstructions({
    fullRegen: exitQuizInstructions,
    addOne: addOneQuizInstructions,
    rewriteOne: rewriteOneQuizInstructions,
  }),
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

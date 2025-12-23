import { createSectionAgent } from "../createSectionAgent";
import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { starterQuizInstructions } from "./starterQuiz.instructions";
import { StarterQuizSchema } from "./starterQuiz.schema";

export const starterQuizAgent = createSectionAgent({
  responseSchema: StarterQuizSchema,
  instructions: starterQuizInstructions,
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

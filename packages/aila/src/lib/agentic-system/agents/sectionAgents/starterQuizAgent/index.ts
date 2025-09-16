import { createSectionAgent } from "../createSectionAgent";
import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { starterQuizInstructions } from "./starterQuiz.instructions";
import { QuizV2Schema } from "./starterQuiz.schema";

export const starterQuizAgent = createSectionAgent({
  responseSchema: QuizV2Schema,
  instructions: starterQuizInstructions,
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

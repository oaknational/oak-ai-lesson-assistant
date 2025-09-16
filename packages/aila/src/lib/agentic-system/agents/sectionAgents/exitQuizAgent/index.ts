import { createSectionAgent } from "../createSectionAgent";
import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { exitQuizInstructions } from "./exitQuiz.instructions";
import { QuizV2Schema } from "./exitQuiz.schema";

export const exitQuizAgent = createSectionAgent({
  responseSchema: QuizV2Schema,
  instructions: exitQuizInstructions,
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

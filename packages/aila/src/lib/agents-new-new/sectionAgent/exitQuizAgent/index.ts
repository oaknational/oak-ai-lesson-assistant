import { createSectionAgent } from "../createSectionAgent";
import { exitQuizInstructions } from "./exitQuizInstructions";
import { QuizV2Schema } from "./exitQuizSchema";

export const exitQuizAgent = createSectionAgent({
  responseSchema: QuizV2Schema,
  instructions: exitQuizInstructions,
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
});

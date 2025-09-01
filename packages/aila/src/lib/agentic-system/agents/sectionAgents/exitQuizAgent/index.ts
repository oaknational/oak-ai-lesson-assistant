import { createSectionAgent } from "../createSectionAgent";
import { exitQuizInstructions } from "./exitQuiz.instructions";
import { QuizV2Schema } from "./exitQuiz.schema";

export const exitQuizAgent = createSectionAgent({
  responseSchema: QuizV2Schema,
  instructions: exitQuizInstructions,
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
});

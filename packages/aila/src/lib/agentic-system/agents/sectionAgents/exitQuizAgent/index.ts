import { createSectionAgent } from "../createSectionAgent";
import { exitQuizInstructions } from "./exitQuiz.instructions";
import { ExitQuizSchema } from "./exitQuiz.schema";

export const exitQuizAgent = createSectionAgent({
  responseSchema: ExitQuizSchema,
  instructions: exitQuizInstructions,
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
});

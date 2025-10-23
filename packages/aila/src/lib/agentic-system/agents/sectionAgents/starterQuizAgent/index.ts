import { createSectionAgent } from "../createSectionAgent";
import { starterQuizInstructions } from "./starterQuiz.instructions";
import { QuizV2Schema } from "./starterQuiz.schema";

export const starterQuizAgent = createSectionAgent({
  responseSchema: QuizV2Schema,
  instructions: starterQuizInstructions,
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
});

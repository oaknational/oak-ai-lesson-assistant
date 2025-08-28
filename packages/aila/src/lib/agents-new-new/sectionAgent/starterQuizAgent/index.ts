import { createSectionAgent } from "../createSectionAgent";
import { starterQuizInstructions } from "./starterQuizInstructions";
import { QuizV2Schema } from "./starterQuizSchema";

export const starterQuizAgent = createSectionAgent({
  responseSchema: QuizV2Schema,
  instructions: starterQuizInstructions,
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
});

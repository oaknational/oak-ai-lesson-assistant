import { createSectionAgent } from "../createSectionAgent";
import { titleInstructions } from "./titleInstructions";
import { LessonTitleSchema } from "./titleSchema";

export const titleAgent = createSectionAgent({
  responseSchema: LessonTitleSchema,
  instructions: titleInstructions,
});

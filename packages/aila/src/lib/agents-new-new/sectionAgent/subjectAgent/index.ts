import { createSectionAgent } from "../createSectionAgent";
import { subjectInstructions } from "./subjectInstructions";
import { SubjectSchema } from "./subjectSchema";

export const subjectAgent = createSectionAgent({
  responseSchema: SubjectSchema,
  instructions: subjectInstructions,
});

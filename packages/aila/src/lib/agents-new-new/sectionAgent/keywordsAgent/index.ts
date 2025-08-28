import { stringListToText } from "../../utils/stringListToText";
import { createSectionAgent } from "../createSectionAgent";
import { keywordsInstructions } from "./keywordsInstructions";
import { KeywordsSchema } from "./keywordsSchema";

export const keywordsAgent = createSectionAgent({
  responseSchema: KeywordsSchema,
  instructions: keywordsInstructions,
  contentToString: stringListToText((k) => `${k.keyword}: ${k.definition}`),
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
});

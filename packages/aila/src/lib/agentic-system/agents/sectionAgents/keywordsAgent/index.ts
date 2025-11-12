import { stringListToText } from "../../../utils/stringListToText";
import { createSectionAgent } from "../createSectionAgent";
import { keywordsInstructions } from "./keywords.instructions";
import { KeywordsSchema } from "./keywords.schema";

export const keywordsAgent = createSectionAgent({
  responseSchema: KeywordsSchema,
  instructions: keywordsInstructions,
  contentToString: stringListToText((k) => `${k.keyword}: ${k.definition}`),
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
});

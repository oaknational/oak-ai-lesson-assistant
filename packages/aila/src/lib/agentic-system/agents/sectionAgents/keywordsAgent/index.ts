import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { stringListToText } from "../../../utils/stringListToText";
import {
  createSectionAgent,
  keyStageBuildModeInstructions,
} from "../createSectionAgent";
import {
  addOneKeywordInstructions,
  changeOneKeywordInstructions,
  keywordsInstructions,
} from "./keywords.instructions";
import { KeywordsSchema } from "./keywords.schema";

export const keywordsAgent = createSectionAgent({
  responseSchema: KeywordsSchema,
  instructions: keyStageBuildModeInstructions({
    fullRegen: keywordsInstructions,
    addOne: addOneKeywordInstructions,
    rewriteOne: changeOneKeywordInstructions,
  }),
  contentToString: stringListToText((k) => `${k.keyword}: ${k.definition}`),
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

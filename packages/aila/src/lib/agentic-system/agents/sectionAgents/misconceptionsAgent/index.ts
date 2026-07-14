import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { stringListToText } from "../../../utils/stringListToText";
import {
  createSectionAgent,
  keyStageBuildModeInstructions,
} from "../createSectionAgent";
import {
  addOneMisconceptionInstructions,
  changeOneMisconceptionInstructions,
  misconceptionsInstructions,
} from "./misconceptions.instructions";
import { MisconceptionsSchema } from "./misconceptions.schema";

export const misconceptionsAgent = createSectionAgent({
  responseSchema: MisconceptionsSchema,
  instructions: keyStageBuildModeInstructions({
    fullRegen: misconceptionsInstructions,
    addOne: addOneMisconceptionInstructions,
    rewriteOne: changeOneMisconceptionInstructions,
  }),
  contentToString: stringListToText(
    (m) => `${m.misconception}: ${m.description}`,
  ),
  defaultVoice: "EXPERT_TEACHER",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

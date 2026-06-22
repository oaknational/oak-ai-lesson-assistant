import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { deriveSectionBuildMode } from "../../../quizOperations/deriveSectionBuildMode";
import { stringListToText } from "../../../utils/stringListToText";
import { createSectionAgent } from "../createSectionAgent";
import {
  addOneMisconceptionInstructions,
  changeOneMisconceptionInstructions,
  misconceptionsInstructions,
} from "./misconceptions.instructions";
import { MisconceptionsSchema } from "./misconceptions.schema";

export const misconceptionsAgent = createSectionAgent({
  responseSchema: MisconceptionsSchema,
  instructions: (ctx) => {
    const mode = deriveSectionBuildMode(ctx.currentTurn.currentStep);
    switch (mode.kind) {
      case "fullRegen":
        return misconceptionsInstructions;
      case "addOne":
        return addOneMisconceptionInstructions;
      case "rewriteOne":
        return changeOneMisconceptionInstructions(mode.position);
    }
  },
  contentToString: stringListToText(
    (m) => `${m.misconception}: ${m.description}`,
  ),
  defaultVoice: "EXPERT_TEACHER",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

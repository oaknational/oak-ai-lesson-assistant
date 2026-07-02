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
    const keyStage = ctx.currentTurn.document.keyStage ?? "";
    const mode = deriveSectionBuildMode(ctx.currentTurn.currentStep);
    switch (mode.kind) {
      case "fullRegen":
        return misconceptionsInstructions(keyStage);
      case "addOne":
        return addOneMisconceptionInstructions(keyStage);
      case "rewriteOne":
        return changeOneMisconceptionInstructions(mode.position, keyStage);
    }
  },
  contentToString: stringListToText(
    (m) => `${m.misconception}: ${m.description}`,
  ),
  defaultVoice: "EXPERT_TEACHER",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

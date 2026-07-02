import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { deriveSectionBuildMode } from "../../../quizOperations/deriveSectionBuildMode";
import { stringListToText } from "../../../utils/stringListToText";
import { createSectionAgent } from "../createSectionAgent";
import {
  addOneKeywordInstructions,
  changeOneKeywordInstructions,
  keywordsInstructions,
} from "./keywords.instructions";
import { KeywordsSchema } from "./keywords.schema";

export const keywordsAgent = createSectionAgent({
  responseSchema: KeywordsSchema,
  instructions: (ctx) => {
    const keyStage = ctx.currentTurn.document.keyStage ?? "";
    const mode = deriveSectionBuildMode(ctx.currentTurn.currentStep);
    switch (mode.kind) {
      case "fullRegen":
        return keywordsInstructions(keyStage);
      case "addOne":
        return addOneKeywordInstructions(keyStage);
      case "rewriteOne":
        return changeOneKeywordInstructions(mode.position, keyStage);
    }
  },
  contentToString: stringListToText((k) => `${k.keyword}: ${k.definition}`),
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { createSectionAgent } from "../createSectionAgent";
import {
  addOneQuizInstructions,
  exitQuizInstructions,
  rewriteOneQuizInstructions,
} from "./exitQuiz.instructions";
import { ExitQuizSchema } from "./exitQuiz.schema";

export const exitQuizAgent = createSectionAgent({
  responseSchema: ExitQuizSchema,
  instructions: exitQuizInstructions,
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

export const exitQuizAddOneAgent = createSectionAgent({
  responseSchema: ExitQuizSchema,
  instructions: addOneQuizInstructions,
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

export const exitQuizRewriteOneAgent = createSectionAgent({
  responseSchema: ExitQuizSchema,
  instructions:
    "Rewrite a single quiz question. Return only the replacement question. Do not modify or output any other questions.",
  extraInputFromCtx: (ctx) => {
    const position = ctx.currentTurn.currentStep?.quizIntent?.position;
    return position == null
      ? []
      : [{ role: "developer" as const, content: rewriteOneQuizInstructions(position) }];
  },
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

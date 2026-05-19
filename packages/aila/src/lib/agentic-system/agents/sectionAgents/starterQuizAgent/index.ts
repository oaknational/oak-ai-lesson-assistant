import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { createSectionAgent } from "../createSectionAgent";
import {
  addOneQuizInstructions,
  rewriteOneQuizInstructions,
  starterQuizInstructions,
} from "./starterQuiz.instructions";
import { StarterQuizSchema } from "./starterQuiz.schema";

export const starterQuizAgent = createSectionAgent({
  responseSchema: StarterQuizSchema,
  instructions: starterQuizInstructions,
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

export const starterQuizAddOneAgent = createSectionAgent({
  responseSchema: StarterQuizSchema,
  instructions: addOneQuizInstructions,
  defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

export const starterQuizRewriteOneAgent = createSectionAgent({
  responseSchema: StarterQuizSchema,
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

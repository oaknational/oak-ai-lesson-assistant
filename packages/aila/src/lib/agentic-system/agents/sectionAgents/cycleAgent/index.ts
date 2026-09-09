import type { Cycle } from "../../../../../protocol/schema";
import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { cycleTargetPromptPart } from "../../sharedPromptParts/cycleTarget.part";
import {
  createSectionAgent,
  keyStageInstructions,
} from "../createSectionAgent";
import { cyclesInstructions } from "./cycle.instructions";
import type { CycleAgentResponse } from "./cycle.schema";
import { CycleAgentResponseSchema } from "./cycle.schema";

// The examples and current values shown in the prompt come from stored
// lessons, where practice is already a composed string rather than parts,
// so the prompt side uses the stored Cycle type.
export const cycleAgent = createSectionAgent<CycleAgentResponse, Cycle>({
  responseSchema: CycleAgentResponseSchema,
  instructions: keyStageInstructions(cyclesInstructions),
  extraInputFromCtx: (ctx) => {
    const promptPart = cycleTargetPromptPart(ctx);
    return promptPart ? [{ role: "developer", content: promptPart }] : [];
  },
  defaultVoice: "EXPERT_TEACHER",
  // The practice task is pupil-facing; the prompt references this voice.
  voices: ["TEACHER_TO_PUPIL_WRITTEN"],
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
});

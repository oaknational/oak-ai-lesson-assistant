import type { PlannerOutput } from "../schema";
import { createPromptPartMessageFn } from "./_createPromptPart";

export const plannerAgentResponsePromptPart =
  createPromptPartMessageFn<PlannerOutput>({
    heading: "PLANNING AGENT RESPONSE",
    description: () =>
      "The agent responsible for planning how to process the user's request gave the following response.",
    contentToString: (plannerOutput) => JSON.stringify(plannerOutput),
  });

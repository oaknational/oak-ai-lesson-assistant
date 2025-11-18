import type { SectionStep } from "../../schema";
import { createPromptPartMessageFn } from "./_createPromptPart";

export const stepsExecutedPromptPart = createPromptPartMessageFn<SectionStep[]>(
  {
    heading: "STEPS EXECUTED",
    description: () =>
      "These are the steps that were executed during this turn.",
    contentToString: (steps) =>
      steps.map((step) => `- ${step.sectionKey}: ${step.action}`).join("\n"),
  },
);

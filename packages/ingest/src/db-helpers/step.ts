import { IngestError } from "../IngestError";

export const STEP = [
  "import",
  "captions_fetch",
  "lesson_plan_generation",
  "chunking",
  "embedding",
] as const;

const STEP_STATUS = ["started", "completed", "failed"] as const;

export type Step = (typeof STEP)[number];
export type StepStatus = (typeof STEP_STATUS)[number];

export function getPrevStep(step: Step) {
  const index = STEP.indexOf(step);
  if (index === -1) {
    throw new IngestError("Invalid step passed to getPrevStep");
  }
  if (index === 0) {
    throw new IngestError("Cannot get previous step of the first step");
  }
  const prevStep = STEP[index - 1];
  if (!prevStep) {
    throw new IngestError("Could not get previous step");
  }

  return prevStep;
}

import type { z } from "zod";

import { CycleSchema } from "../../../../../protocol/schema";
import { PracticeTaskPartsSchema } from "./practiceTask";

export { CycleSchema };

/**
 * What the cycle agent returns: the document's cycle shape, but with the
 * practice task as structured parts. Code composes the stored `practice` and
 * `practiceSlideText` strings from the parts (see practiceTask.ts), so the
 * model never writes the derived slide text itself.
 */
export const CycleAgentResponseSchema = CycleSchema.omit({
  practice: true,
  practiceSlideText: true,
  practiceStimulusSlideText: true,
}).extend({
  practice: PracticeTaskPartsSchema,
});

export type CycleAgentResponse = z.infer<typeof CycleAgentResponseSchema>;

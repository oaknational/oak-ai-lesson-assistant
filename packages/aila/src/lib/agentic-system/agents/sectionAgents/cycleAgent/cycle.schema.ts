import type { z } from "zod";

import { CycleSchema } from "../../../../../protocol/schema";
import { FeedbackPiecesSchema } from "./feedback";
import { PracticeTaskPartsSchema } from "./practiceTask";

export { CycleSchema };

/**
 * What the cycle agent returns: the document's cycle shape, but with the
 * practice task and feedback as structured parts. Code composes the stored
 * strings from the parts (see practiceTask.ts and feedback.ts), so the model
 * never writes derived slide text, numbering, or type labels itself.
 */
export const CycleAgentResponseSchema = CycleSchema.omit({
  practice: true,
  practiceSlideText: true,
  practiceStimulusSlideText: true,
  feedback: true,
}).extend({
  practice: PracticeTaskPartsSchema,
  feedback: FeedbackPiecesSchema,
});

export type CycleAgentResponse = z.infer<typeof CycleAgentResponseSchema>;

import type { z } from "zod";

import {
  CYCLE_COMPOSED_SLIDE_FIELDS,
  CycleSchema,
} from "../../../../../protocol/schema";
import { FeedbackPiecesSchema } from "./feedback";
import { PracticeTaskPartsSchema } from "./practiceTask";

export { CycleSchema };

/**
 * What the cycle agent returns: the stored cycle shape, but with the practice
 * task and feedback as structured parts. Our code builds the stored strings
 * from those parts (see practiceTask.ts and feedback.ts), so the model never
 * writes slide text, numbering, or labels itself.
 */
export const CycleAgentResponseSchema = CycleSchema.omit(
  CYCLE_COMPOSED_SLIDE_FIELDS,
).extend({
  practice: PracticeTaskPartsSchema,
  feedback: FeedbackPiecesSchema,
});

export type CycleAgentResponse = z.infer<typeof CycleAgentResponseSchema>;

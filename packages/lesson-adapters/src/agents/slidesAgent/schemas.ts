import { z } from "zod";

import type { SlideContent } from "../../slides/extraction/types";
import { SUPPORTED_EDIT_TYPES } from "./intents";

// ---------------------------------------------------------------------------
// Input Schema
// ---------------------------------------------------------------------------

export const generateSlidePlanInputSchema = z.object({
  editType: z.string().refine((v) => SUPPORTED_EDIT_TYPES.includes(v), {
    message: `editType must be one of: ${SUPPORTED_EDIT_TYPES.join(", ")}`,
  }),
  userMessage: z.string().min(1),
  slides: z.custom<SlideContent[]>(
    (val) => Array.isArray(val) && val.length > 0,
    { message: "slides must be a non-empty array" },
  ),
});

export type GenerateSlidePlanInput = z.infer<
  typeof generateSlidePlanInputSchema
>;

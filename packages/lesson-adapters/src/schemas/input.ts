import { z } from "zod";

import { slideDeckContentSchema } from "../slides/extraction/schemas";

// ---------------------------------------------------------------------------
// Generate Plan Input
// ---------------------------------------------------------------------------

/**
 * Input schema for generating an adaptation plan.
 *
 * This is the entry point for the planning service.
 * The slideDeck must include all necessary information about the slides
 * (structure, content, metadata) so the planning service can make
 * appropriate recommendations without additional context.
 */
export const generatePlanInputSchema = z.object({
  userMessage: z.string().min(1).describe("User request for lesson adaptation"),
  slideDeck: slideDeckContentSchema,
});

export type GeneratePlanInput = z.infer<typeof generatePlanInputSchema>;

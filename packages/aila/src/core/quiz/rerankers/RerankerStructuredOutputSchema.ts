import { z } from "zod";

import type { BaseType } from "../ChoiceModels";

export const ratingResponseSchema = z.object({
  justification: z
    .string()
    .describe("The chain of thought that led to the rating"),
  rating: z
    .number()
    .describe(
      "The rating for the given criteria and response taking the chain of thought into account. The rating is a float between 0 and 1.",
    ),
}) satisfies z.ZodType<BaseType & Record<string, unknown>>;

export type RatingResponse = z.infer<typeof ratingResponseSchema>;

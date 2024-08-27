import { z } from "zod";

export const rateLimitInfoSchema = z.union([
  z.object({
    isSubjectToRateLimiting: z.literal(false),
  }),
  z.object({
    isSubjectToRateLimiting: z.literal(true),
    limit: z.number(),
    remaining: z.number(),
    reset: z.number(),
  }),
]);

export type RateLimitInfo = z.infer<typeof rateLimitInfoSchema>;

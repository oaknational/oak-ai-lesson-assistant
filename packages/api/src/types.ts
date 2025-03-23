import { z } from "zod";

export const rateLimitInfoSchema = z.union([
  z.object({
    isSubjectToRateLimiting: z.literal(false),
  }),
  // NOTE: at the moment all rate limits are subject to limiting
  z.object({
    isSubjectToRateLimiting: z.literal(true),
    limit: z.number(),
    remaining: z.number(),
    reset: z.number(),
  }),
]);

export type RateLimitInfo = z.infer<typeof rateLimitInfoSchema>;

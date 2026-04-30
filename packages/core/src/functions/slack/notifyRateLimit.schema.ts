import z from "zod";

export const notifyRateLimitSchema = z.object({
  user: z.object({
    id: z.string(),
  }),
  data: z.object({
    limit: z.number(),
    reset: z.coerce.date(),
  }),
});

export type NotifyRateLimitInput = z.infer<typeof notifyRateLimitSchema>;

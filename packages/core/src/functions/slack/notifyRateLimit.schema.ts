import z from "zod";

export const notifyRateLimitSchema = {
  user: z.object({
    id: z.string(),
  }),
  data: z.object({
    limit: z.number(),
    reset: z.coerce.date(),
  }),
};

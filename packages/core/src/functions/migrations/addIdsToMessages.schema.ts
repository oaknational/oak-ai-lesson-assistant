import { z } from "zod";

export const addIdsToMessagesSchema = {
  data: z.object({
    dryRun: z.boolean().default(true),
  }),
};

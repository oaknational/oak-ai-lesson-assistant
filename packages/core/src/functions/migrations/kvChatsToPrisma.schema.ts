import { z } from "zod";

export const kvChatsToPrismaSchema = {
  data: z.object({
    dryRun: z.boolean().default(true),
  }),
};

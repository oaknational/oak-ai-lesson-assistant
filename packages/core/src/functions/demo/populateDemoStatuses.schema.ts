import z from "zod";

export const populateDemoStatusesSchema = {
  data: z.object({
    dryRun: z.boolean().default(true),
  }),
};

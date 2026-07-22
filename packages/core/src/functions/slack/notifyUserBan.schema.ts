import z from "zod/v3";

export const notifyUserBanSchema = z.object({
  user: z.object({
    id: z.string(),
  }),
  data: z.object({}),
});

export type NotifyUserBanInput = z.infer<typeof notifyUserBanSchema>;

import z from "zod";

export const notifyUserBanSchema = {
  user: z.object({
    id: z.string(),
  }),
  data: z.object({}),
};

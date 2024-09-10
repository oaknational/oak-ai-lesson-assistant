import z from "zod";

export const notifyModerationSchema = {
  user: z.object({
    id: z.string(),
  }),
  data: z.object({
    chatId: z.string(),
    moderationId: z.string(),
    justification: z.string(),
    categories: z.array(z.string()),
  }),
};

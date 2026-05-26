import z from "zod";

export const notifyModerationSchema = z.object({
  user: z.object({
    id: z.string(),
  }),
  data: z.object({
    chatId: z.string(),
    justification: z.string(),
    categories: z.array(z.string()),
    safetyLevel: z.enum(["toxic", "highly-sensitive"]).optional(),
  }),
});

export type NotifyModerationInput = z.infer<typeof notifyModerationSchema>;

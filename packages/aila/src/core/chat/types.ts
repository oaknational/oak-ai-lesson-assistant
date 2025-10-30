import { z } from "zod";

export const MessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  role: z.union([
    z.literal("data"),
    z.literal("user"),
    z.literal("system"),
    z.literal("assistant"),
  ]),
});

export type Message = z.infer<typeof MessageSchema>;

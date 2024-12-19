import { z } from "zod";

export const MessageSchema = z.object({
  content: z.string(),
  role: z.enum(["system", "assistant", "user", "data"]),
  id: z.string(),
});

export type Message = z.infer<typeof MessageSchema>;

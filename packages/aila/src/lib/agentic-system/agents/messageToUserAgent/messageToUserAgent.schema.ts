import { z } from "zod";

export const messageToUserAgentSchema = z.object({
  message: z.string(),
});

export type MessageToUserAgentOutput = z.infer<typeof messageToUserAgentSchema>;

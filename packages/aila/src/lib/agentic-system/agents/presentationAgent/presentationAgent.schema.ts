import { z } from "zod";

export const presentationAgentSchema = z.object({
  message: z.string(),
});

export type PresentationAgentOutput = z.infer<typeof presentationAgentSchema>;

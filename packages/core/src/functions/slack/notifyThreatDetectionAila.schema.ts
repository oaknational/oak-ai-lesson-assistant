import z from "zod";

import {
  threatDetectionMessageSchema,
  threatDetectionResultSchema,
} from "../../threatDetection/types";

export const notifyThreatDetectionAilaSchema = z.object({
  user: z.object({
    id: z.string(),
  }),
  data: z.object({
    chatId: z.string(),
    userAction: z.string(),
    threatDetection: threatDetectionResultSchema,
    messages: z.array(threatDetectionMessageSchema),
  }),
});

export type NotifyThreatDetectionAilaInput = z.infer<
  typeof notifyThreatDetectionAilaSchema
>;

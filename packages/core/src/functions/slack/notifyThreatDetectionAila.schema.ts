import z from "zod";

import {
  threatDetectionResultSchema,
  threatDetectionMessageSchema,
} from "../../threatDetection/types";

export const notifyThreatDetectionAilaSchema = {
  user: z.object({
    id: z.string(),
  }),
  data: z.object({
    chatId: z.string(),
    userAction: z.string(),
    threatDetection: threatDetectionResultSchema,
    messages: z.array(threatDetectionMessageSchema),
  }),
};

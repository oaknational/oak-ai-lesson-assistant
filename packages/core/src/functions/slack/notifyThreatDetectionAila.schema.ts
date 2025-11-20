import z from "zod";

import { lakeraGuardResponseSchema } from "../../threatDetection/lakera";
import { messageSchema } from "../../threatDetection/lakera/schema";

export const notifyThreatDetectionAilaSchema = {
  user: z.object({
    id: z.string(),
  }),
  data: z.object({
    chatId: z.string(),
    userAction: z.string(),
    threatDetection: lakeraGuardResponseSchema,
    messages: z.array(messageSchema),
  }),
};

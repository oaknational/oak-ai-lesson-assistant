import z from "zod";

import { lakeraGuardResponseSchema } from "../../threatDetection/lakera";
import { messageSchema } from "../../threatDetection/lakera/schema";

/**
 * Schema for formatted threat detection data sent to Slack
 */
export const threatDetectionForSlackSchema = z.object({
  flagged: z.boolean(),
  userInput: z.string(),
  detectedThreats: z.array(
    z.object({
      detectorType: z.string(),
      detectorId: z.string().optional(),
    }),
  ),
  requestId: z.string().optional(),
});

export const notifyThreatDetectionTeachingMaterialsSchema = {
  user: z.object({
    id: z.string(),
  }),
  data: z.object({
    id: z.string(),
    userAction: z.string(),
    threatDetection: lakeraGuardResponseSchema,
    messages: z.array(messageSchema),
  }),
};

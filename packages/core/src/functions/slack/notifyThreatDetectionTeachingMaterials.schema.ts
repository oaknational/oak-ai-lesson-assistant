import z from "zod";

import {
  threatDetectionMessageSchema,
  threatDetectionResultSchema,
} from "../../threatDetection/types";

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

export const notifyThreatDetectionTeachingMaterialsSchema = z.object({
  user: z.object({
    id: z.string(),
  }),
  data: z.object({
    id: z.string(),
    userAction: z.string(),
    threatDetection: threatDetectionResultSchema,
    messages: z.array(threatDetectionMessageSchema),
  }),
});

export type NotifyThreatDetectionTeachingMaterialsInput = z.infer<
  typeof notifyThreatDetectionTeachingMaterialsSchema
>;

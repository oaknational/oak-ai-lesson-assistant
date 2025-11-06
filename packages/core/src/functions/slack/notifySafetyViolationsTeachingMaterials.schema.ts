import z from "zod";

/**
 * Schema for formatted threat detection data sent to Slack
 */
export const threatDetectionForSlackSchema = z.object({
  flagged: z.boolean(),
  userInput: z.string(),
  detectedThreats: z.array(
    z.object({
      detectorType: z.string(),
      detectorId: z.string(),
    }),
  ),
  requestId: z.string().optional(),
});

export const notifySafetyViolationsTeachingMaterialsSchema = {
  user: z.object({
    id: z.string(),
  }),
  data: z.object({
    id: z.string(),
    justification: z.string(),
    categories: z.array(z.string()),
    userAction: z.string(),
    violationType: z.string(),
    threatDetection: threatDetectionForSlackSchema.optional(),
  }),
};

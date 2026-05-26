import z from "zod";

import {
  threatDetectionMessageSchema,
  threatDetectionResultSchema,
} from "../../threatDetection/types";

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

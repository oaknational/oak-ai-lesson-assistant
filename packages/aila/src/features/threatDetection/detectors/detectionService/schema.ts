import { threatDetectionResultSchema } from "@oakai/core/src/threatDetection/types";

import { z } from "zod";

/**
 * The standalone service's v1 response, which is
 * `threatDetectionResultSchema` in snake_case plus a `detection_id`.
 *
 * Declared here rather than trusted, because the service is deployed
 * separately and can change shape without this repository rebuilding. A parse
 * failure throws, which ends the turn — the same outcome as the service being
 * unreachable, and the right one: a response we cannot read is not a verdict.
 */
export const detectionServiceFindingSchema = z.object({
  category: threatDetectionResultSchema.shape.findings.element.shape.category,
  severity: threatDetectionResultSchema.shape.findings.element.shape.severity,
  provider_code: z.string(),
  detected: z.boolean(),
  snippet: z.string().optional(),
  start: z.number().optional(),
  end: z.number().optional(),
  confidence: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const detectionServiceResponseSchema = z.object({
  provider: z.string().min(1),
  is_threat: z.boolean(),
  severity: threatDetectionResultSchema.shape.severity,
  category: threatDetectionResultSchema.shape.category,
  message: z.string(),
  findings: z.array(detectionServiceFindingSchema),
  details: z
    .object({
      detected_elements: z.array(z.string()).optional(),
      confidence: z.number().optional(),
      recommended_action: z.string().optional(),
    })
    .optional(),
  detection_id: z.string().uuid().optional(),
});

export type DetectionServiceResponse = z.infer<
  typeof detectionServiceResponseSchema
>;

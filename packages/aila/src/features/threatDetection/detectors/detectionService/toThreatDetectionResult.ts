import type { ThreatDetectionResult } from "@oakai/core/src/threatDetection/types";

import type { DetectionServiceResponse } from "./schema";

/**
 * The service and this repository share a threat vocabulary — the category and
 * severity enums are identical — so this is a case conversion rather than a
 * translation. `detection_id` becomes `requestId`, which is what makes a
 * verdict traceable back to the service's own record of it.
 */
export function toDetectionServiceThreatDetectionResult(
  response: DetectionServiceResponse,
): ThreatDetectionResult {
  return {
    provider: response.provider,
    isThreat: response.is_threat,
    severity: response.severity,
    category: response.category,
    message: response.message,
    requestId: response.detection_id,
    rawResponse: response,
    findings: response.findings.map((finding) => ({
      category: finding.category,
      severity: finding.severity,
      providerCode: finding.provider_code,
      detected: finding.detected,
      snippet: finding.snippet,
      start: finding.start,
      end: finding.end,
      confidence: finding.confidence,
      metadata: finding.metadata,
    })),
    details: response.details
      ? {
          detectedElements: response.details.detected_elements,
          confidence: response.details.confidence,
          recommendedAction: response.details.recommended_action,
        }
      : {},
  };
}

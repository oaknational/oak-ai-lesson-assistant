import type {
  ThreatCategory,
  ThreatDetectionResult,
  ThreatSeverity,
} from "../types";
import type { BreakdownItem, LakeraGuardResponse } from "./schema";

function mapLakeraSeverity(detectorType: string): ThreatSeverity {
  switch (detectorType) {
    case "jailbreak":
    case "prompt_injection":
      return "critical";
    case "pii":
    case "sensitive_info":
    case "harmful_content":
      return "high";
    default:
      return "high";
  }
}

function mapLakeraCategory(detectorType: string): ThreatCategory {
  switch (detectorType) {
    case "jailbreak":
      return "system_prompt_override";
    case "prompt_injection":
      return "prompt_injection";
    case "pii":
      return "pii";
    case "sensitive_info":
      return "rag_exfiltration";
    default:
      return "other";
  }
}

function getHighestThreatFromBreakdown(
  breakdown: BreakdownItem[] | undefined,
): BreakdownItem | undefined {
  if (!breakdown?.length) {
    return undefined;
  }

  const severityOrder: ThreatSeverity[] = ["low", "medium", "high", "critical"];

  return breakdown.reduce<BreakdownItem | undefined>((highest, current) => {
    if (!current.detected) {
      return highest;
    }

    if (!highest) {
      return current;
    }

    return severityOrder.indexOf(mapLakeraSeverity(current.detector_type)) >
      severityOrder.indexOf(mapLakeraSeverity(highest.detector_type))
      ? current
      : highest;
  }, undefined);
}

export function toLakeraThreatDetectionResult(
  data: LakeraGuardResponse,
): ThreatDetectionResult {
  const highestThreat = getHighestThreatFromBreakdown(data.breakdown);

  return {
    provider: "lakera",
    isThreat: data.flagged,
    severity: highestThreat
      ? mapLakeraSeverity(highestThreat.detector_type)
      : undefined,
    category: highestThreat
      ? mapLakeraCategory(highestThreat.detector_type)
      : undefined,
    message: data.flagged ? "Potential threat detected" : "No threats detected",
    rawResponse: data,
    requestId: data.metadata?.request_uuid,
    findings:
      data.breakdown
        ?.filter((item) => item.detected)
        .map((item) => ({
          category: mapLakeraCategory(item.detector_type),
          severity: mapLakeraSeverity(item.detector_type),
          providerCode: item.detector_type,
          detected: item.detected,
          snippet: data.payload?.find(
            (payload) => payload.detector_type === item.detector_type,
          )?.text,
          metadata: {
            detectorId: item.detector_id,
            policyId: item.policy_id,
            projectId: item.project_id,
          },
        })) ?? [],
    details: {
      detectedElements: data.payload?.map((payload) => payload.text) ?? [],
    },
  };
}

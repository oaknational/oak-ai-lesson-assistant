export type ThreatDetectionProvider = "lakera" | "model_armor";

const ACTIVE_THREAT_DETECTION_PROVIDER: ThreatDetectionProvider = "model_armor";

export function getThreatDetectionProvider(): ThreatDetectionProvider {
  return ACTIVE_THREAT_DETECTION_PROVIDER;
}

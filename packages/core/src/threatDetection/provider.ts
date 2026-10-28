import { aiLogger } from "@oakai/logger";

const log = aiLogger("aila:threat");

export type ThreatDetectionProvider =
  | "lakera"
  | "model_armor"
  | "detection_service";

const PROVIDERS: ThreatDetectionProvider[] = [
  "lakera",
  "model_armor",
  "detection_service",
];

const DEFAULT_THREAT_DETECTION_PROVIDER: ThreatDetectionProvider =
  "model_armor";

/**
 * Environment-driven so a preview can change provider without a commit, which
 * is what lets a branch-scoped Vercel variable point one deployment at the
 * standalone service while every other deployment keeps the default.
 *
 * An unrecognised value falls back rather than throwing: a typo in a variable
 * should not take chat down, and the warning says what happened.
 */
export function getThreatDetectionProvider(): ThreatDetectionProvider {
  const configured = process.env.THREAT_DETECTION_PROVIDER;

  if (!configured) {
    return DEFAULT_THREAT_DETECTION_PROVIDER;
  }

  if (!PROVIDERS.includes(configured as ThreatDetectionProvider)) {
    log.warn(
      `Unknown THREAT_DETECTION_PROVIDER "${configured}", falling back to ${DEFAULT_THREAT_DETECTION_PROVIDER}`,
    );
    return DEFAULT_THREAT_DETECTION_PROVIDER;
  }

  return configured as ThreatDetectionProvider;
}

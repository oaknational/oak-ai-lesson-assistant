import {
  threatFindingSchema,
  threatDetectionResultSchema,
  threatCategorySchema,
  type ThreatFinding,
  type ThreatDetectionResult,
  type ThreatCategory,
  type ThreatSeverity,
  threatSeveritySchema,
} from "@oakai/core/src/threatDetection/types";

export {
  threatFindingSchema,
  threatDetectionResultSchema,
  threatCategorySchema,
  threatSeveritySchema,
  type ThreatFinding,
  type ThreatDetectionResult,
  type ThreatCategory,
  type ThreatSeverity,
};

export abstract class AilaThreatDetector {
  protected readonly severityOrder: ThreatSeverity[] = [
    "low",
    "medium",
    "high",
    "critical",
  ];

  protected abstract authenticate(): Promise<void>;

  abstract detectThreat(content: unknown): Promise<ThreatDetectionResult>;

  abstract isThreatError(error: unknown): Promise<boolean>;

  protected compareSeverity(a: ThreatSeverity, b: ThreatSeverity): number {
    return this.severityOrder.indexOf(a) - this.severityOrder.indexOf(b);
  }
}

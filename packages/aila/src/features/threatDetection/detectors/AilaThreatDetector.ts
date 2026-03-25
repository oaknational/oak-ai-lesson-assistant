import {
  type ThreatCategory,
  type ThreatDetectionMessage,
  type ThreatDetectionResult,
  type ThreatFinding,
  type ThreatSeverity,
  threatCategorySchema,
  threatDetectionMessageSchema,
  threatDetectionResultSchema,
  threatFindingSchema,
  threatSeveritySchema,
} from "@oakai/core/src/threatDetection/types";

export {
  threatFindingSchema,
  threatDetectionMessageSchema,
  threatDetectionResultSchema,
  threatCategorySchema,
  threatSeveritySchema,
  type ThreatDetectionMessage,
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

  abstract detectThreat(
    content: ThreatDetectionMessage[],
  ): Promise<ThreatDetectionResult>;

  isThreatError(_error: unknown): boolean {
    return false;
  }

  protected compareSeverity(a: ThreatSeverity, b: ThreatSeverity): number {
    return this.severityOrder.indexOf(a) - this.severityOrder.indexOf(b);
  }
}

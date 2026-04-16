import {
  type ThreatDetectionMessage,
  type ThreatDetectionResult,
  type ThreatSeverity,
} from "@oakai/core/src/threatDetection/types";

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

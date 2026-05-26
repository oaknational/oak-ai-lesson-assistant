import type {
  ThreatDetectionMessage,
  ThreatDetectionResult,
} from "@oakai/core/src/threatDetection/types";

export interface AilaThreatDetector {
  detectThreat(
    content: ThreatDetectionMessage[],
  ): Promise<ThreatDetectionResult>;
}

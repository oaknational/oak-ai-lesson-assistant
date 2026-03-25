import type { AilaThreatDetectionFeature } from "../types";
import type {
  AilaThreatDetector,
  ThreatDetectionMessage,
  ThreatDetectionResult,
  ThreatSeverity,
} from "./detectors/AilaThreatDetector";

export class AilaThreatDetection implements AilaThreatDetectionFeature {
  private readonly _detectors: AilaThreatDetector[];

  constructor(_detectors: AilaThreatDetector[]) {
    this._detectors = _detectors;
  }

  get detectors(): AilaThreatDetector[] {
    return this._detectors;
  }

  async detectThreat(
    content: ThreatDetectionMessage[],
  ): Promise<ThreatDetectionResult> {
    const results = await Promise.all(
      this.detectors.map((detector) => detector.detectThreat(content)),
    );

    const threatResults = results.filter((result) => result.isThreat);

    if (threatResults.length === 0) {
      return {
        provider: "aggregate",
        isThreat: false,
        message: "No threats detected",
        findings: [],
        details: { confidence: 1.0 },
      };
    }

    // Return the highest severity threat
    const severityOrder: ThreatSeverity[] = [
      "low",
      "medium",
      "high",
      "critical",
    ];
    return threatResults.reduce((highest, current) => {
      if (!highest?.severity || !current.severity) return current;
      return severityOrder.indexOf(current.severity) >
        severityOrder.indexOf(highest.severity)
        ? current
        : highest;
    }, threatResults[0]!);
  }

  isThreatError(error: unknown): boolean {
    const results = this.detectors.map((detector) =>
      detector.isThreatError(error),
    );
    return results.some((result) => result);
  }
}

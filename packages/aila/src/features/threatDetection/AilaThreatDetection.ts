import type { AilaThreatDetectionFeature } from "../types";
import type {
  AilaThreatDetector,
  ThreatDetectionResult,
} from "./detectors/AilaThreatDetector";

export class AilaThreatDetection implements AilaThreatDetectionFeature {
  private readonly _detectors: AilaThreatDetector[];

  constructor(_detectors: AilaThreatDetector[]) {
    this._detectors = _detectors;
  }

  get detectors(): AilaThreatDetector[] {
    return this._detectors;
  }

  async detectThreat(content: unknown): Promise<ThreatDetectionResult> {
    const results = await Promise.all(
      this.detectors.map((detector) => detector.detectThreat(content)),
    );

    const threatResults = results.filter((result) => result.isThreat);

    if (threatResults.length === 0) {
      return {
        isThreat: false,
        message: "No threats detected",
        details: { confidence: 1.0 },
      };
    }

    // Return the highest severity threat
    const severityOrder: ["low", "medium", "high", "critical"] = [
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

  async isThreatError(error: unknown): Promise<boolean> {
    const results = await Promise.all(
      this.detectors.map((detector) => detector.isThreatError(error)),
    );
    return results.some((result) => result);
  }
}

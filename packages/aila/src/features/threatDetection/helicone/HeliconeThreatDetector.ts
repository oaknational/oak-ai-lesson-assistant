import type { ThreatDetectionResult } from "../detectors/AilaThreatDetector";
import { AilaThreatDetector } from "../detectors/AilaThreatDetector";

export class HeliconeThreatDetector extends AilaThreatDetector {
  protected async authenticate(): Promise<void> {
    return Promise.resolve();
  }

  async detectThreat(): Promise<ThreatDetectionResult> {
    // Stub implementation since Helicone doesn't have a direct threat detection API
    return Promise.resolve({
      isThreat: false,
      message: "Helicone threat detection not implemented",
      details: {
        confidence: 0,
      },
    });
  }

  async isThreatError(error: unknown): Promise<boolean> {
    const isIt: boolean =
      error instanceof Error &&
      "code" in error &&
      error.code === "PROMPT_THREAT_DETECTED";
    return Promise.resolve(isIt);
  }
}

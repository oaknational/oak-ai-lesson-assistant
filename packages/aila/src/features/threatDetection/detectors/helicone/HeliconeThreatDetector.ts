import type {
  ThreatDetectionMessage,
  ThreatDetectionResult,
} from "../AilaThreatDetector";
import { AilaThreatDetector } from "../AilaThreatDetector";

export class HeliconeThreatDetector extends AilaThreatDetector {
  async detectThreat(
    _content: ThreatDetectionMessage[],
  ): Promise<ThreatDetectionResult> {
    return {
      provider: "helicone",
      isThreat: false,
      message: "Helicone threat detection not implemented",
      findings: [],
      details: {
        confidence: 0,
      },
    };
  }

  isThreatError(error: unknown): boolean {
    const isIt: boolean =
      error instanceof Error &&
      "code" in error &&
      error.code === "PROMPT_THREAT_DETECTED";
    return isIt;
  }
}

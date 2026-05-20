import type {
  ThreatDetectionMessage,
  ThreatDetectionResult,
} from "@oakai/core/src/threatDetection/types";

import type { AilaThreatDetector } from "./AilaThreatDetector";

export class MockThreatDetector implements AilaThreatDetector {
  private readonly _response: boolean;
  constructor({ response }: { response: boolean }) {
    this._response = response;
  }

  detectThreat(
    _content: ThreatDetectionMessage[],
  ): Promise<ThreatDetectionResult> {
    return Promise.resolve({
      provider: "mock",
      isThreat: this._response,
      message: "Mocked response",
      findings: [],
    });
  }
}

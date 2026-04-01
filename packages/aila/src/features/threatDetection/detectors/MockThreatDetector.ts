import type {
  ThreatDetectionMessage,
  ThreatDetectionResult,
} from "@oakai/core/src/threatDetection/types";

import { AilaThreatDetector } from "./AilaThreatDetector";

export class MockThreatDetector extends AilaThreatDetector {
  private readonly _response: boolean;
  constructor({ response }: { response: boolean }) {
    super();
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

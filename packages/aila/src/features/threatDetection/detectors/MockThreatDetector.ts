import {
  AilaThreatDetector,
  type ThreatDetectionMessage,
  type ThreatDetectionResult,
} from "./AilaThreatDetector";

export class MockThreatDetector extends AilaThreatDetector {
  private readonly _response: boolean;
  constructor({ response }: { response: boolean }) {
    super();
    this._response = response;
  }

  async detectThreat(
    _content: ThreatDetectionMessage[],
  ): Promise<ThreatDetectionResult> {
    return {
      provider: "mock",
      isThreat: this._response,
      message: "Mocked response",
      findings: [],
    };
  }
}

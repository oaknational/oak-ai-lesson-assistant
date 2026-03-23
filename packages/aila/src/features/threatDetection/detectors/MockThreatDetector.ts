import {
  AilaThreatDetector,
  type ThreatDetectionResult,
} from "./AilaThreatDetector";

export class MockThreatDetector extends AilaThreatDetector {
  private readonly _response: boolean;
  constructor({ response }: { response: boolean }) {
    super();
    this._response = response;
  }

  async authenticate(): Promise<void> {}
  async detectThreat(): Promise<ThreatDetectionResult> {
    return {
      provider: "mock",
      isThreat: this._response,
      message: "Mocked response",
      findings: [],
    };
  }
  async isThreatError(): Promise<boolean> {
    return Promise.resolve(false);
  }
}

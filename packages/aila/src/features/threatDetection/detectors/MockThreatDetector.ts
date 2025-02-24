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
    return Promise.resolve({
      isThreat: this._response,
      message: "Mocked response",
    });
  }
  async isThreatError(): Promise<boolean> {
    return Promise.resolve(false);
  }
}

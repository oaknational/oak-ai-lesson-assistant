import { AilaThreatDetector } from "./AilaThreatDetector";

export class MockThreatDetector extends AilaThreatDetector {
  private readonly _response: boolean;
  constructor({ response }: { response: boolean }) {
    super();
    this._response = response;
  }
  async isThreat() {
    return Promise.resolve(this._response);
  }
}

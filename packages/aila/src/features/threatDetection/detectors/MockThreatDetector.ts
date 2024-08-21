import { AilaThreatDetector } from "./AilaThreatDetector";

export class MockThreatDetector extends AilaThreatDetector {
  private _response: boolean;
  constructor({ response }: { response: boolean }) {
    super();
    this._response = response;
  }
  async isThreat() {
    return this._response;
  }
}

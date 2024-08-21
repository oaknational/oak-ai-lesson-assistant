import { LLMService } from "../../src/core/llm/LLMService";

export class MockLLMService implements LLMService {
  private _response: Uint8Array = new Uint8Array();
  public name = "MockLLMService";

  constructor(response?: string) {
    if (response) {
      this.setResponse(response);
    } else {
      this.setResponse("Default mock response");
    }
  }

  setResponse(response: string) {
    const encoder = new TextEncoder();
    this._response = encoder.encode(response);
  }

  async createChatCompletionStream(): Promise<
    ReadableStreamDefaultReader<Uint8Array | undefined>
  > {
    const response = this._response;
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(response);
        controller.close();
      },
    });

    return stream.getReader();
  }
}

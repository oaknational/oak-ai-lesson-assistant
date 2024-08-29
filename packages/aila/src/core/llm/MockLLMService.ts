import { LLMService } from "./LLMService";

export class MockLLMService implements LLMService {
  name = "MockLLM";
  private responseChunks: string[];

  constructor(responseChunks: string[] = ["This is ", "a mock ", "response."]) {
    this.responseChunks = responseChunks;
  }

  async createChatCompletionStream(): Promise<
    ReadableStreamDefaultReader<Uint8Array | undefined>
  > {
    const encoder = new TextEncoder();
    const responseChunks = this.responseChunks;
    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of responseChunks) {
          controller.enqueue(encoder.encode(chunk));
          await new Promise((resolve) => setTimeout(resolve, 4));
        }
        controller.close();
      },
    });
    return stream.getReader();
  }

  setResponse(chunks: string[]) {
    this.responseChunks = chunks;
  }
}

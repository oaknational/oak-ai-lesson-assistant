import { LLMService } from "./LLMService";

export class MockLLMService implements LLMService {
  name = "MockLLM";
  private responseChunks: string[];
  private responseObject: Record<string, unknown>;

  constructor(
    responseChunks: string[] = ["This is ", "a mock ", "response."],
    responseObject: Record<string, unknown> = {
      response: "This is a response",
      mock: true,
      status: "complete",
    },
  ) {
    this.responseChunks = responseChunks;
    this.responseObject = responseObject;
  }

  async createChatCompletionStream(): Promise<
    ReadableStreamDefaultReader<string>
  > {
    const responseChunks = this.responseChunks;
    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of responseChunks) {
          controller.enqueue(chunk);
          await new Promise((resolve) => setTimeout(resolve, 4));
        }
        controller.close();
      },
    });
    return stream.getReader();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createChatCompletionObjectStream(): Promise<AsyncIterable<any>> {
    const obj = this.responseObject;
    return {
      async *[Symbol.asyncIterator]() {
        const keys = Object.keys(obj);
        const partialObject: Record<string, unknown> = {};

        for (const key of keys) {
          partialObject[key] = obj[key];
          yield partialObject;
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      },
    };
  }

  setResponse(chunks: string[]) {
    this.responseChunks = chunks;
  }
}

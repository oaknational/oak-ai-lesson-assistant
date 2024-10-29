import type { LLMService } from "./LLMService";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
    return new Promise<ReadableStreamDefaultReader<string>>((resolve) => {
      const responseChunks = this.responseChunks;
      const stream = new ReadableStream({
        async start(controller) {
          for (const chunk of responseChunks) {
            controller.enqueue(chunk);
            await sleep(0);
          }
          controller.close();
        },
      });
      resolve(stream.getReader());
    });
  }
  async createChatCompletionObjectStream(): Promise<
    ReadableStreamDefaultReader<string>
  > {
    return new Promise<ReadableStreamDefaultReader<string>>((resolve) => {
      const responseChunks = this.responseChunks;
      const stream = new ReadableStream({
        async start(controller) {
          for (const chunk of responseChunks) {
            controller.enqueue(chunk);
            await sleep(0);
          }
          controller.close();
        },
      });
      resolve(stream.getReader());
    });
  }

  setResponse(chunks: string[]) {
    this.responseChunks = chunks;
  }
}

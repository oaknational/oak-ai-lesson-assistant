import type { OpenAIModelParams } from "../../constants";
import type { LLMService } from "./LLMService";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockLLMService implements LLMService {
  name = "MockLLM";
  private responseChunks: string[];
  private readonly responseObject: Record<string, unknown>;

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

  async createChatCompletionStream(_params: {
    modelParams: OpenAIModelParams;
    messages: any[];
  }): Promise<ReadableStreamDefaultReader<string>> {
    const responseChunks = this.responseChunks;
    const stream = new ReadableStream<string>({
      async start(controller) {
        for (const chunk of responseChunks) {
          controller.enqueue(chunk);
          await sleep(0);
        }
        controller.close();
      },
    });
    return Promise.resolve(stream.getReader());
  }
  async createChatCompletionObjectStream(_params: {
    modelParams: OpenAIModelParams;
    schema: any;
    schemaName: string;
    messages: any[];
  }): Promise<ReadableStreamDefaultReader<string>> {
    const responseChunks = this.responseChunks;
    const stream = new ReadableStream<string>({
      async start(controller) {
        for (const chunk of responseChunks) {
          controller.enqueue(chunk);
          await sleep(0);
        }
        controller.close();
      },
    });
    return Promise.resolve(stream.getReader());
  }

  setResponse(chunks: string[]) {
    this.responseChunks = chunks;
  }
}

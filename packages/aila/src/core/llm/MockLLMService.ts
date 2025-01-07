import { aiLogger } from "@oakai/logger";

import type { LLMService } from "./LLMService";

const log = aiLogger("aila:llm");

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockLLMService implements LLMService {
  name = "MockLLM";
  private responseChunks: string[];
  private readonly responseObject: object;

  constructor(
    responseChunks: string[] = ["This is ", "a mock ", "response."],
    responseObject?: object,
  ) {
    this.responseChunks = responseChunks;
    this.responseObject = responseObject ?? {};
  }

  async createChatCompletionStream(): Promise<
    ReadableStreamDefaultReader<string>
  > {
    log.info("Creating chat completion stream", this.name);
    const responseChunks = this.responseChunks;
    return new Promise<ReadableStreamDefaultReader<string>>((resolve) => {
      const stream = new ReadableStream({
        start(controller) {
          for (const chunk of responseChunks) {
            controller.enqueue(chunk);
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
    log.info("Creating chat completion object stream", this.name);
    const serviceName = this.name;
    const responseChunks = this.responseChunks;
    return new Promise<ReadableStreamDefaultReader<string>>((resolve) => {
      const stream = new ReadableStream({
        start(controller) {
          for (const chunk of responseChunks) {
            controller.enqueue(chunk);
          }
          log.info("Stream closed", serviceName);
          controller.close();
        },
      });
      resolve(stream.getReader());
    });
  }

  generateObject<T>(): Promise<T | undefined> {
    return new Promise((resolve) => {
      resolve(this.responseObject as T);
    });
  }

  setResponse(chunks: string[]) {
    this.responseChunks = chunks;
  }
}

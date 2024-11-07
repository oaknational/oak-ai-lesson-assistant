import type { LLMService } from "./LLMService";

export class NullLLMService implements LLMService {
  name = "NullLLM";

  async createChatCompletionStream(): Promise<
    ReadableStreamDefaultReader<string>
  > {
    return new Promise<ReadableStreamDefaultReader<string>>(
      (_resolve, reject) => {
        reject(new Error("Method not implemented."));
      },
    );
  }

  async createChatCompletionObjectStream(): Promise<
    ReadableStreamDefaultReader<string>
  > {
    return new Promise<ReadableStreamDefaultReader<string>>(
      (_resolve, reject) => {
        reject(new Error("Method not implemented."));
      },
    );
  }

  generateObject<T>(): Promise<T | undefined> {
    return new Promise((_resolve, reject) => {
      reject(new Error("Method not implemented."));
    });
  }
}

import { Message } from "../chat";

export interface LLMService {
  name: string;
  createChatCompletionStream(params: {
    model: string;
    messages: Message[];
    temperature: number;
  }): Promise<ReadableStreamDefaultReader<Uint8Array | undefined>>;
}

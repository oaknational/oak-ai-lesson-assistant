import { ZodSchema } from "zod";

import { Message } from "../chat";

export interface LLMService {
  name: string;
  createChatCompletionStream(params: {
    model: string;
    messages: Message[];
    temperature: number;
  }): Promise<ReadableStreamDefaultReader<string>>;
  createChatCompletionObjectStream(params: {
    model: string;
    schema: ZodSchema;
    schemaName: string;
    messages: Message[];
    temperature: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): Promise<ReadableStreamDefaultReader<string>>;
}

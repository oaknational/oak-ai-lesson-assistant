import type { ZodSchema } from "zod";

import type { Message } from "../chat";

export interface LLMService {
  name: string;
  createChatCompletionObjectStream(params: {
    model: string;
    schema: ZodSchema;
    schemaName: string;
    messages: Message[];
    temperature: number;
  }): Promise<ReadableStreamDefaultReader<string>>;
}

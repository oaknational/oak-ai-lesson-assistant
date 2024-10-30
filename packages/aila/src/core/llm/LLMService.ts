import type { GenerateObjectResult } from "ai";
import type { ZodSchema } from "zod";

import type { Message } from "../chat";

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
  }): Promise<ReadableStreamDefaultReader<string>>;
  generateObject<T>(params: {
    model: string;
    schema: ZodSchema<T>;
    schemaName: string;
    messages: Message[];
    temperature: number;
  }): Promise<T | undefined>;
}

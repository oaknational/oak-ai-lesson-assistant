import type { ZodSchema } from "zod";

import type { Message } from "../chat";

export interface LLMService {
  name: string;
  createChatCompletionStream(params: {
    model: string;
    messages: Message[];
    temperature?: number;
    reasoning_effort?: "low" | "medium" | "high";
    verbosity?: "low" | "medium" | "high";
  }): Promise<ReadableStreamDefaultReader<string>>;
  createChatCompletionObjectStream(params: {
    model: string;
    schema: ZodSchema;
    schemaName: string;
    messages: Message[];
    temperature?: number;
    reasoning_effort?: "low" | "medium" | "high";
    verbosity?: "low" | "medium" | "high";
  }): Promise<ReadableStreamDefaultReader<string>>;
}

import type { ZodSchema } from "zod";

import type { OpenAIModelParams } from "../../constants";
import type { Message } from "../chat";

export interface LLMService {
  name: string;
  createChatCompletionStream(params: {
    modelParams: OpenAIModelParams;
    messages: Message[];
  }): Promise<ReadableStreamDefaultReader<string>>;
  createChatCompletionObjectStream(params: {
    modelParams: OpenAIModelParams;
    schema: ZodSchema;
    schemaName: string;
    messages: Message[];
  }): Promise<ReadableStreamDefaultReader<string>>;
}

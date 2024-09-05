import { OpenAIProvider } from "@ai-sdk/openai";
import { HeliconeChatMeta } from "@oakai/core/src/llm/helicone";
import { createOpenAIProvider } from "@oakai/core/src/llm/openai";
import { streamObject, streamText } from "ai";
import { ZodSchema } from "zod";

import { Message } from "../chat";
import { LLMService } from "./LLMService";

export class OpenAIService implements LLMService {
  private _openAIProvider: OpenAIProvider;

  public name = "OpenAIService";

  constructor({ userId, chatId }: HeliconeChatMeta) {
    this._openAIProvider = createOpenAIProvider({
      chatMeta: { userId, chatId },
      app: "lesson-assistant",
    });
  }

  async createChatCompletionStream(params: {
    model: string;
    messages: Message[];
    temperature: number;
  }): Promise<ReadableStreamDefaultReader<string>> {
    const { textStream: stream } = await streamText({
      model: this._openAIProvider(params.model),
      messages: params.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: params.temperature,
    });

    return stream.getReader();
  }

  async createChatCompletionObjectStream(params: {
    model: string;
    schema: ZodSchema;
    schemaName: string;
    messages: Message[];
    temperature: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): Promise<ReadableStreamDefaultReader<string>> {
    console.log("Stream object");
    const { textStream: stream } = await streamObject({
      model: this._openAIProvider(params.model, { structuredOutputs: true }),
      output: "object",
      schema: params.schema,
      messages: params.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: params.temperature,
    });

    return stream.getReader();
  }
}

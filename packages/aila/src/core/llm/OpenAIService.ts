import type { OpenAIProvider } from "@ai-sdk/openai";
import type { HeliconeChatMeta } from "@oakai/core/src/llm/helicone";
import { createVercelOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";
import {
  generateObject as aiGenerateObject,
  streamObject,
  streamText,
} from "ai";
import type { ZodSchema } from "zod";

import type { Message } from "../chat";
import type { LLMService } from "./LLMService";

const log = aiLogger("aila:llm");

const STRUCTURED_OUTPUTS_ENABLED =
  process.env.NEXT_PUBLIC_STRUCTURED_OUTPUTS_ENABLED === "true";
export class OpenAIService implements LLMService {
  private readonly _openAIProvider: OpenAIProvider;

  public name = "OpenAIService";

  constructor({ userId, chatId }: HeliconeChatMeta) {
    this._openAIProvider = createVercelOpenAIClient({
      chatMeta: { userId, chatId },
      app: "lesson-assistant",
    });
    log.info("Initialize service ", { service: this.name });
  }

  async createChatCompletionStream(params: {
    model: string;
    messages: Message[];
    temperature: number;
  }): Promise<ReadableStreamDefaultReader<string>> {
    log.info("Create chat completion stream", { service: this.name });
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
  }): Promise<ReadableStreamDefaultReader<string>> {
    log.info("Create chat completion object stream", { service: this.name });
    const { model, messages, temperature, schema, schemaName } = params;
    if (!STRUCTURED_OUTPUTS_ENABLED) {
      return this.createChatCompletionStream({ model, messages, temperature });
    }
    const startTime = Date.now();
    const { textStream: stream } = await streamObject({
      model: this._openAIProvider(model, { structuredOutputs: true }),
      output: "object",
      schema,
      schemaName,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
    });

    const reader = stream.getReader();
    const { value } = await reader.read();
    const timeToFirstToken = Date.now() - startTime;

    log.info(`Time to first token: ${timeToFirstToken}ms`);

    const newStream = new ReadableStream({
      start(controller) {
        controller.enqueue(value);
      },
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(value);
        }
      },
    });

    return newStream.getReader();
  }

  async generateObject<T>({
    model,
    schema,
    schemaName,
    messages,
    temperature,
  }: {
    model: string;
    schema: ZodSchema<T>;
    schemaName: string;
    messages: Message[];
    temperature: number;
  }): Promise<T> {
    const result = await aiGenerateObject<T>({
      model: this._openAIProvider(model, { structuredOutputs: true }),
      output: "object",
      schema,
      schemaName,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
    });
    return result.object;
  }
}

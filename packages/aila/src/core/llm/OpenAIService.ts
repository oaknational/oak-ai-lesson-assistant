import { OpenAIProvider } from "@ai-sdk/openai";
import { HeliconeChatMeta } from "@oakai/core/src/llm/helicone";
import { createVercelOpenAIClient } from "@oakai/core/src/llm/openai";
import { streamObject, streamText } from "ai";
import { ZodSchema } from "zod";

import { Message } from "../chat";
import { LLMService } from "./LLMService";

const STRUCTURED_OUTPUTS_ENABLED =
  process.env.NEXT_PUBLIC_STRUCTURED_OUTPUTS_ENABLED === "true" ? true : false;
export class OpenAIService implements LLMService {
  private _openAIProvider: OpenAIProvider;

  public name = "OpenAIService";

  constructor({ userId, chatId }: HeliconeChatMeta) {
    this._openAIProvider = createVercelOpenAIClient({
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
    console.log(`Time to first token: ${timeToFirstToken}ms`);

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
}

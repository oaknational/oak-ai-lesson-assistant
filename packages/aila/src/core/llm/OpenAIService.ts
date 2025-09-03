import type { HeliconeChatMeta } from "@oakai/core/src/llm/helicone";
import { createVercelOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";

import type { OpenAIProvider } from "@ai-sdk/openai";
import { streamObject, streamText } from "ai";
import type { ZodSchema } from "zod";

import type { OpenAIModelParams } from "../../constants";
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
  }

  async createChatCompletionStream(params: {
    modelParams: OpenAIModelParams;
    messages: Message[];
  }): Promise<ReadableStreamDefaultReader<string>> {
    const { textStream: stream } = streamText({
      model: this._openAIProvider(params.modelParams.model),
      messages: params.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      ...("temperature" in params.modelParams
        ? { temperature: params.modelParams.temperature }
        : {}),
    });

    return Promise.resolve(stream.getReader());
  }

  async createChatCompletionObjectStream(params: {
    modelParams: OpenAIModelParams;
    schema: ZodSchema;
    schemaName: string;
    messages: Message[];
  }): Promise<ReadableStreamDefaultReader<string>> {
    const { modelParams, messages, schema, schemaName } = params;
    if (!STRUCTURED_OUTPUTS_ENABLED) {
      return this.createChatCompletionStream({ modelParams, messages });
    }
    const startTime = Date.now();
    const { textStream: stream } = streamObject({
      model: this._openAIProvider(modelParams.model, {
        structuredOutputs: true,
      }),
      output: "object",
      schema,
      schemaName,
      // With GPT-5, only the default (1) temperature value is supported.
      temperature: "temperature" in modelParams ? modelParams.temperature : 1,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      // 👇 This is where we should be passing gpt-5 params, but it's not available in this version of Vercel AI SDK
      // providerOptions: {
      //   openai: {
      //     reasoning_effort: "medium", // default is medium
      //     verbosity: "medium" // default is medium
      //   },
      // },
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
}

import type { HeliconeChatMeta } from "@oakai/core/src/llm/helicone";
import { createVercelOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";

import type { OpenAIProvider } from "@ai-sdk/openai";
import { streamObject, streamText } from "ai";
import type { ZodSchema } from "zod";

import { isGPT5Model } from "../../constants";
import type { Message } from "../chat";
import type { LLMService } from "./LLMService";
import { 
  createModelParams, 
  extractAPIParams, 
  type ModelOptions 
} from "../types/modelParameters";

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
    model: string;
    messages: Message[];
    temperature?: number;
    reasoning_effort?: "low" | "medium" | "high";
    verbosity?: "low" | "medium" | "high";
  }): Promise<ReadableStreamDefaultReader<string>> {
    const { model, messages, temperature, reasoning_effort, verbosity } = params;
    
    const options: ModelOptions = {
      temperature,
      reasoning_effort,
      verbosity,
    };

    const typedParams = createModelParams(model, messages, options, isGPT5Model);
    const apiParams = extractAPIParams(typedParams);

    // Remove model and messages from apiParams to avoid duplication
    const { model: _, messages: __, ...additionalParams } = apiParams;
    const finalParams = {
      model: this._openAIProvider(model),
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      ...additionalParams,
    };

    const { textStream: stream } = streamText(finalParams);
    return Promise.resolve(stream.getReader());
  }

  async createChatCompletionObjectStream(params: {
    model: string;
    schema: ZodSchema;
    schemaName: string;
    messages: Message[];
    temperature?: number;
    reasoning_effort?: "low" | "medium" | "high";
    verbosity?: "low" | "medium" | "high";
  }): Promise<ReadableStreamDefaultReader<string>> {
    const { model, messages, temperature, reasoning_effort, verbosity, schema, schemaName } = params;
    if (!STRUCTURED_OUTPUTS_ENABLED) {
      return this.createChatCompletionStream({ model, messages, temperature, reasoning_effort, verbosity });
    }
    const startTime = Date.now();

    const options: ModelOptions = {
      temperature,
      reasoning_effort,
      verbosity,
    };

    const typedParams = createModelParams(model, messages, options, isGPT5Model);
    const apiParams = extractAPIParams(typedParams);

    // Remove model and messages from apiParams to avoid duplication
    const { model: _, messages: __, ...additionalParams } = apiParams;
    
    const modelParams = {
      model: this._openAIProvider(model, { structuredOutputs: true }),
      output: "object" as const,
      schema,
      schemaName,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      ...additionalParams,
    };

    const { textStream: stream } = streamObject(modelParams);

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

import type { HeliconeChatMeta } from "@oakai/core/src/llm/helicone";
import { createVercelOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";

import type { OpenAIProvider } from "@ai-sdk/openai";
import { streamObject } from "ai";
import type { ZodSchema } from "zod";

import type { Message } from "../chat";
import type { LLMService } from "./LLMService";

const log = aiLogger("aila:llm");

export class OpenAIServiceObject implements LLMService {
  private readonly _openAIProvider: OpenAIProvider;

  public name = "OpenAIService";

  constructor({ userId, chatId }: HeliconeChatMeta) {
    this._openAIProvider = createVercelOpenAIClient({
      chatMeta: { userId, chatId },
      app: "lesson-assistant",
    });
  }

  async createChatCompletionObjectStream(params: {
    model: string;
    schema: ZodSchema;
    schemaName: string;
    messages: Message[];
    temperature: number;
  }): Promise<ReadableStreamDefaultReader<string>> {
    const { model, messages, temperature, schema, schemaName } = params;
    const startTime = Date.now();
    // const { textStream: stream } = streamObject({
    const { partialObjectStream } = streamObject({
      model: this._openAIProvider(model, { structuredOutputs: true }),
      output: "object",
      // output: 'array',
      schema,
      schemaName,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
    });

    /**
    Stream of partial objects. It gets more complete as the stream progresses.

    Note that the partial object is not validated.
    If you want to be certain that the actual content matches your schema, you need to implement your own validation for partial results.
       */
    // readonly partialObjectStream: AsyncIterableStream<PARTIAL>;
    /**
     * Stream over complete array elements. Only available if the output strategy is set to `array`.
     */
    // readonly elementStream: ELEMENT_STREAM;
    /**
    Text stream of the JSON representation of the generated object. It contains text chunks.
    When the stream is finished, the object is valid JSON that can be parsed.
       */
    // readonly textStream: AsyncIterableStream<string>;
    /**
    Stream of different types of events, including partial objects, errors, and finish events.
    Only errors that stop the stream, such as network errors, are thrown.
       */
    // readonly fullStream: AsyncIterableStream<ObjectStreamPart<PARTIAL>>;

    // TODO

    // const reader = stream.getReader();
    // const { value } = await reader.read();
    // const timeToFirstToken = Date.now() - startTime;

    // log.info(`Time to first token: ${timeToFirstToken}ms`);

    // const newStream = new ReadableStream({
    //   start(controller) {
    //     controller.enqueue(value);
    //   },
    //   async pull(controller) {
    //     const { done, value } = await reader.read();
    //     if (done) {
    //       controller.close();
    //     } else {
    //       controller.enqueue(value);
    //     }
    //   },
    // });

    // return newStream.getReader();
  }
}

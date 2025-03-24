import type { HeliconeChatMeta } from "@oakai/core/src/llm/helicone";
import { createVercelOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";

import type { OpenAIProvider } from "@ai-sdk/openai";
import { createDataStreamResponse, streamObject } from "ai";
import type { ZodSchema } from "zod";

import type { Message } from "../chat";
import type { LLMService } from "./LLMService";

const log = aiLogger("aila:llm");

export class OpenAIServiceCustomData implements LLMService {
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

    const response = createDataStreamResponse({
      execute: (dataStream) => {
        const { textStream: stream } = streamObject({
          model: this._openAIProvider(model, { structuredOutputs: true }),
          output: "object",
          schema,
          schemaName,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature,
          // onChunk() {
          //   dataStream.writeMessageAnnotation({ chunk: "123" });
          // },
          // onFinish() {
          //   // message annotation:
          //   dataStream.writeMessageAnnotation({
          //     id: generateId(), // e.g. id from saved DB record
          //     other: "information",
          //   });
          //   // call annotation:
          //   dataStream.writeData("call completed");
          // },
        });
        result.mergeIntoDataStream(dataStream);
      },
      onError: (error) => {
        // Error messages are masked by default for security reasons.
        // If you want to expose the error message to the client, you can do so here:
        return error instanceof Error ? error.message : String(error);
      },
    });

    // createDataStream: creates a data stream
    // createDataStreamResponse: creates a response object that streams data
    // pipeDataStreamToResponse: pipes a data stream to a server response object

    const reader = stream.getReader();
    const { value } = await reader.read();
    const timeToFirstToken = Date.now() - startTime;

    log.info(`Time to first token: ${timeToFirstToken}ms`);

    //   const newStream = new ReadableStream({
    //     start(controller) {
    //       controller.enqueue(value);
    //     },
    //     async pull(controller) {
    //       const { done, value } = await reader.read();
    //       if (done) {
    //         controller.close();
    //       } else {
    //         controller.enqueue(value);
    //       }
    //     },
    //   });

    //   return newStream.getReader();
  }
}

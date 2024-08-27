import {
  HeliconeChatMeta,
  createOpenAIClient,
} from "@oakai/core/src/llm/openai";
import { OpenAIStream } from "ai";
import OpenAI from "openai";
import { Stream } from "openai/streaming";

import { Message } from "../chat";
import { LLMService } from "./LLMService";

export class OpenAIService implements LLMService {
  private _openAIClient: OpenAI;

  public name = "OpenAIService";

  constructor({ userId, chatId }: HeliconeChatMeta) {
    this._openAIClient = createOpenAIClient({
      app: "lesson-assistant",
      chatMeta: {
        userId,
        chatId,
      },
    });
  }

  async createChatCompletionStream(params: {
    model: string;
    messages: Message[];
    temperature: number;
  }): Promise<ReadableStreamDefaultReader<Uint8Array | undefined>> {
    const res = await this._openAIClient.chat.completions.create({
      stream: true,
      stream_options: {
        include_usage: true,
      },
      ...params,
    });
    if (res instanceof Stream) {
      const openAiStream: ReadableStream<Uint8Array | undefined> =
        OpenAIStream(res);
      return openAiStream.getReader();
    } else if (res) {
      // Handle the ChatCompletion case here if necessary
      throw new Error("Received ChatCompletion instead of a Stream.");
    } else {
      throw new Error("Failed to create chat completion stream.");
    }
  }
}

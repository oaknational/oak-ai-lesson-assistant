import { Message } from "@oakai/aila";
import { LLMService } from "@oakai/aila/src/core/llm/LLMService";
import { OpenAIService } from "@oakai/aila/src/core/llm/OpenAIService";
import fs from "fs/promises";
import { ZodSchema } from "zod";

export class FixtureLoggerLLMService implements LLMService {
  name = "FixureLoggerLLM";
  public fixtureName: string;
  private _openAIService: OpenAIService;

  constructor(fixtureName: string, chatId: string) {
    this.fixtureName = fixtureName;
    this._openAIService = new OpenAIService({ userId: undefined, chatId });
  }

  async createChatCompletionStream(params: {
    model: string;
    messages: Message[];
    temperature: number;
  }): Promise<ReadableStreamDefaultReader<string>> {
    return this._openAIService.createChatCompletionStream(params);
  }

  async createChatCompletionObjectStream(params: {
    model: string;
    schema: ZodSchema;
    schemaName: string;
    messages: Message[];
    temperature: number;
  }): Promise<ReadableStreamDefaultReader<string>> {
    const upstreamReader =
      await this._openAIService.createChatCompletionObjectStream(params);

    const chunks: string[] = [];
    const fixtureName = this.fixtureName;

    const s = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await upstreamReader.read();
          if (done) {
            break;
          }
          chunks.push(value);
          controller.enqueue(value);
        }

        const formattedUrl = new URL(
          `recordings/${fixtureName}.formatted.txt`,
          import.meta.url,
        );
        const formatted = JSON.stringify(JSON.parse(chunks.join("")), null, 2);
        console.log("Fixtures: Writing formatted to", formattedUrl.pathname);
        await fs.writeFile(formattedUrl, formatted);

        const chunksUrl = new URL(
          `recordings/${fixtureName}.chunks.txt`,
          import.meta.url,
        );
        const encodedChunks = chunks
          .map((c) => c.replaceAll("\n", "__NEWLINE__"))
          .join("\n");
        console.log("Fixtures: Writing chunks to", chunksUrl.pathname);
        await fs.writeFile(chunksUrl, encodedChunks);

        controller.close();
      },
    });

    return s.getReader();
  }
}

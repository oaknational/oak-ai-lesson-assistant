import type { Message } from "@oakai/aila/src/core/chat";
import type { LLMService } from "@oakai/aila/src/core/llm/LLMService";
import { OpenAIService } from "@oakai/aila/src/core/llm/OpenAIService";
import { aiLogger } from "@oakai/logger";
import fs from "fs/promises";
import type { ZodSchema } from "zod";

const log = aiLogger("fixtures");

export class FixtureRecordLLMService implements LLMService {
  name = "FixtureRecordLLM";
  private readonly _openAIService: OpenAIService;

  constructor(
    public fixtureName: string,
    chatId: string,
  ) {
    this._openAIService = new OpenAIService({ userId: undefined, chatId });
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

        try {
          const formattedUrl = `${process.cwd()}/tests-e2e/recordings/${fixtureName}.formatted.json`;
          const formatted = JSON.stringify(
            JSON.parse(chunks.join("")),
            null,
            2,
          );
          log.info("Writing formatted to", formattedUrl);
          await fs.writeFile(formattedUrl, formatted);
        } catch (e) {
          log.error("Error writing formatted file", e);
        }

        const chunksUrl = `${process.cwd()}/tests-e2e/recordings/${fixtureName}.chunks.txt`;
        const encodedChunks = chunks
          .map((c) => c.replaceAll("\n", "__NEWLINE__"))
          .join("\n");
        log.info("Writing chunks to", chunksUrl);
        await fs.writeFile(chunksUrl, encodedChunks);

        controller.close();
      },
    });

    return s.getReader();
  }
}

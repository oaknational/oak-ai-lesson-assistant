import type { OpenAILike } from "@oakai/aila/src/features/moderation/moderators/OpenAiModerator";
import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";
import fs from "fs/promises";
import type OpenAI from "openai";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources/index.mjs";

const log = aiLogger("fixtures");

export class FixtureRecordOpenAiClient implements OpenAILike {
  constructor(
    public fixtureName: string,
    public chatId: string,
  ) {}

  chat = {
    completions: {
      create: async (
        body: ChatCompletionCreateParamsNonStreaming,
        options?: OpenAI.RequestOptions,
      ) => {
        const openAiClient = createOpenAIClient({
          app: "moderation",
          chatMeta: {
            chatId: this.chatId,
            userId: undefined,
          },
        });
        const response = await openAiClient.chat.completions.create(
          body,
          options,
        );

        const responseText = JSON.stringify(response, null, 2);
        const fileUrl = `${process.cwd()}/tests-e2e/recordings/${this.fixtureName}.moderation.json`;
        log.info("Writing moderation to", fileUrl);
        await fs.writeFile(fileUrl, responseText);

        return response;
      },
    },
  };
}

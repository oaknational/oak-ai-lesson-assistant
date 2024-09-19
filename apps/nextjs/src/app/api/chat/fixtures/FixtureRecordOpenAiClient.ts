import { OpenAILike } from "@oakai/aila/src/features/moderation/moderators/OpenAiModerator";
import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import fs from "fs/promises";
import OpenAI from "openai";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources/index.mjs";

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
        const fileUrl = `tests-e2e/recordings/${this.fixtureName}.moderation.json`;
        console.log("Fixtures: Writing moderation to", fileUrl);
        await fs.writeFile(fileUrl, responseText);

        return response;
      },
    },
  };
}

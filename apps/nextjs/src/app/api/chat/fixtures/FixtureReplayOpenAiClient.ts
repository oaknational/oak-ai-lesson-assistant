import { OpenAILike } from "@oakai/aila/src/features/moderation/moderators/OpenAiModerator";
import fs from "fs/promises";
import OpenAI from "openai";

export class FixtureReplayOpenAiClient implements OpenAILike {
  constructor(public fixtureName: string) {}

  chat = {
    completions: {
      create: async () => {
        const fileUrl = `tests-e2e/recordings/${this.fixtureName}.moderation.json`;
        console.log("Fixtures: Loading moderation from", fileUrl);
        const fixture = await fs.readFile(fileUrl, "utf8");
        return JSON.parse(fixture) as OpenAI.Chat.ChatCompletion;
      },
    },
  };
}

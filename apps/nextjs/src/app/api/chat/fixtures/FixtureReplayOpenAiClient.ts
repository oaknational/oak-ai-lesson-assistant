import type { OpenAILike } from "@oakai/aila/src/features/moderation/moderators/OpenAiModerator";
import { aiLogger } from "@oakai/logger";
import fs from "fs/promises";
import type OpenAI from "openai";

const log = aiLogger("fixtures");

export class FixtureReplayOpenAiClient implements OpenAILike {
  constructor(public fixtureName: string) {}

  chat = {
    completions: {
      create: async () => {
        const fileUrl = `${process.cwd()}/tests-e2e/recordings/${this.fixtureName}.moderation.json`;
        log.info("Loading moderation from", fileUrl);
        const fixture = await fs.readFile(fileUrl, "utf8");
        return JSON.parse(fixture) as OpenAI.Chat.ChatCompletion;
      },
    },
  };
}

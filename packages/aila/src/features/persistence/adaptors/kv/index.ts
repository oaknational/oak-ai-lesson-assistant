import { kv } from "@vercel/kv";

import { AilaPersistence } from "../..";
import { AilaChatService, AilaServices } from "../../../../core";

export class AilaKVPersistence extends AilaPersistence {
  constructor({ chat, aila }: { chat: AilaChatService; aila: AilaServices }) {
    super({ aila, chat, name: "AilaKVPersistence" });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async upsertChat(): Promise<void> {
    const { userId, id } = this.chat;
    if (!id || !userId) {
      return;
    }
    const createdAt = new Date().getTime();

    // Note, this does not save the chat to KV because we are no longer using that approach
    await kv.zadd(`user:chat:${userId}`, {
      score: createdAt,
      member: `chat:${id}`,
    });
  }

  async upsertGeneration(): Promise<void> {
    throw new Error("Not implemented");
  }
  async userOwnsPersistedChat(): Promise<null> {
    throw new Error("Not implemented");
  }
}

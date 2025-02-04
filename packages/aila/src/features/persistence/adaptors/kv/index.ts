import { kv } from "@vercel/kv";

import { AilaPersistence } from "../..";
import type {
  AilaChatService,
  AilaServices,
} from "../../../../core/AilaServices";

export class AilaKVPersistence extends AilaPersistence {
  constructor({ chat, aila }: { chat: AilaChatService; aila: AilaServices }) {
    super({ aila, chat, name: "AilaKVPersistence" });
  }

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
    return Promise.reject(new Error("Not implemented"));
  }
  async loadChat(): Promise<null> {
    return Promise.reject(new Error("Not implemented"));
  }
}

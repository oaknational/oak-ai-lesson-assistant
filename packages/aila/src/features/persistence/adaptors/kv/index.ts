import { kv } from "@vercel/kv";

import { AilaPersistence } from "../..";
import { AilaChatService, AilaServices } from "../../../../core";
import { AilaGeneration } from "../../../generation";

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async upsertGeneration(generation?: AilaGeneration): Promise<void> {
    // Not implemented;
  }
}

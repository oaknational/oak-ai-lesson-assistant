import invariant from "tiny-invariant";

import type { AilaChatService, AilaServices } from "../../core/AilaServices";
import type { AilaOptionsWithDefaultFallbackValues } from "../../core/types";
import type { AilaPersistedChat } from "../../protocol/schema";

export abstract class AilaPersistence {
  protected _chat: AilaChatService;
  protected _name: string;
  protected _aila: AilaServices;

  constructor({
    chat,
    name = "AilaPersistence",
    aila,
  }: {
    chat: AilaChatService;
    name?: string;
    aila: AilaServices;
  }) {
    this._chat = chat;
    this._name = name;
    this._aila = aila;
  }

  get chat() {
    return this._chat;
  }

  get name() {
    return this._name;
  }

  protected createChatPayload(): ChatPersistencePayload {
    const {
      id,
      userId,
      messages,
      isShared,
      relevantLessons,
      ragFetched,
      iteration,
      createdAt,
    } = this._chat;

    invariant(userId, "userId is required for chat persistence");

    const { document, options } = this._aila;
    const {
      subject = "",
      title = "",
      keyStage = "",
      topic = "",
    } = document.content;

    return {
      id,
      userId,
      title,
      subject,
      keyStage,
      topic,
      createdAt: createdAt ? createdAt.getTime() : Date.now(),
      updatedAt: Date.now(),
      iteration: iteration ? iteration + 1 : 1,
      isShared,
      path: `/aila/${id}`,
      lessonPlan: document.content,
      relevantLessons,
      ragFetched,
      messages: messages.filter((m) => ["assistant", "user"].includes(m.role)),
      options,
    };
  }

  abstract loadChat(): Promise<AilaPersistedChat | null>;
  abstract upsertChat(): Promise<void>;
}

export type ChatPersistencePayload = AilaPersistedChat & {
  subject: string;
  keyStage: string;
  topic: string | null;
  options: AilaOptionsWithDefaultFallbackValues;
};

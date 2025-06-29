import type { GenerationStatus } from "@prisma/client";
import invariant from "tiny-invariant";

import { AilaError } from "../../core/AilaError";
import type { AilaChatService, AilaServices } from "../../core/AilaServices";
import type { AilaOptionsWithDefaultFallbackValues } from "../../core/types";
import type { AilaPersistedChat } from "../../protocol/schema";
import type { AilaGeneration } from "../generation/AilaGeneration";

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
      messages: messages.filter((m) => ["assistant", "user"].includes(m.role)),
      options,
    };
  }

  protected createGenerationPayload(
    generation: AilaGeneration,
  ): GenerationPersistencePayload {
    const {
      status,
      id,
      systemPrompt,
      completedAt,
      chat: { userId, id: appSessionId, messages },
      responseText,
      queryDuration,
      tokenUsage,
      promptId,
    } = generation;

    invariant(userId, "userId is required for generation persistence");
    invariant(promptId, "promptId is required for generation persistence");
    const payload: GenerationPersistencePayload = {
      id,
      userId,
      appId: "lesson-planner",
      promptText: systemPrompt,
      completedAt,
      appSessionId,
      response: responseText ?? "",
      llmTimeTaken: queryDuration ? Number(queryDuration) : 0,
      completionTokensUsed: tokenUsage.totalTokens,
      promptId,
      status,
    };

    const lastMessage = messages[messages.length - 1];

    if (status === "SUCCESS") {
      /**
       * On success, we set the messageId to associate the generation with the last message
       *
       * @todo later it would make sense to generate the message_id earlier so that it is
       * stored against the generation from the start
       */

      if (lastMessage?.role !== "assistant") {
        throw new AilaError(
          "Failed to create Generation payload: last message is not an assistant message",
        );
      }
      payload.messageId = lastMessage?.id;
    }

    return payload;
  }

  abstract loadChat(): Promise<AilaPersistedChat | null>;
  abstract upsertChat(): Promise<void>;
  abstract upsertGeneration(generation?: AilaGeneration): Promise<void>;
}

export type ChatPersistencePayload = AilaPersistedChat & {
  subject: string;
  keyStage: string;
  topic: string | null;
  options: AilaOptionsWithDefaultFallbackValues;
};

export interface GenerationPersistencePayload {
  id?: string;
  userId: string;
  appId: string;
  promptText: string;
  completedAt?: Date;
  appSessionId?: string;
  messageId?: string;
  response: string;
  llmTimeTaken: number;
  completionTokensUsed: number;
  promptId: string;
  status: GenerationStatus;
}

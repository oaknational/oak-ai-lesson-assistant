import { GenerationStatus } from "@prisma/client";
import invariant from "tiny-invariant";

import { AilaChatService, AilaError, AilaServices, Message } from "../../core";
import { AilaOptionsWithDefaultFallbackValues } from "../../core/types";
import { LooseLessonPlan } from "../../protocol/schema";
import { AilaGeneration } from "../generation";

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
    const { id, userId, messages, isShared } = this._chat;
    invariant(userId, "userId is required for chat persistence");

    const { lesson, options } = this._aila;
    const { subject = "", title = "", keyStage = "", topic = "" } = lesson.plan;

    return {
      id,
      userId,
      title,
      subject,
      keyStage,
      topic,
      createdAt: Date.now(),
      isShared,
      path: `/aila/${id}`,
      lessonPlan: lesson.plan,
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

  abstract upsertChat(): Promise<void>;
  abstract upsertGeneration(generation?: AilaGeneration): Promise<void>;
}

export interface ChatPersistencePayload {
  id?: string;
  userId: string;
  title: string;
  subject: string;
  keyStage: string;
  topic: string;
  createdAt: number;
  isShared: boolean | undefined;
  path: string;
  lessonPlan: LooseLessonPlan;
  messages: Message[];
  options: AilaOptionsWithDefaultFallbackValues;
}

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

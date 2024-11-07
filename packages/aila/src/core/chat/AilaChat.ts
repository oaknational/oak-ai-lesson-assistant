import {
  subjects,
  unsupportedSubjects,
  subjectWarnings,
} from "@oakai/core/src/utils/subjects";
import invariant from "tiny-invariant";

import { DEFAULT_MODEL, DEFAULT_TEMPERATURE } from "../../constants";
import type { AilaChatService } from "../../core/AilaServices";
import type { AilaServices } from "../../core/AilaServices";
import { AilaGeneration } from "../../features/generation/AilaGeneration";
import type { AilaGenerationStatus } from "../../features/generation/types";
import { generateMessageId } from "../../helpers/chat/generateMessageId";
import type { JsonPatchDocumentOptional } from "../../protocol/jsonPatchProtocol";
import {
  LLMMessageSchema,
  parseMessageParts,
} from "../../protocol/jsonPatchProtocol";
import type {
  AilaPersistedChat,
  AilaRagRelevantLesson,
} from "../../protocol/schema";
import { AilaError } from "../AilaError";
import type { LLMService } from "../llm/LLMService";
import { OpenAIService } from "../llm/OpenAIService";
import type { AilaPromptBuilder } from "../prompt/AilaPromptBuilder";
import { AilaLessonPromptBuilder } from "../prompt/builders/AilaLessonPromptBuilder";
import { AilaStreamHandler } from "./AilaStreamHandler";
import { PatchEnqueuer } from "./PatchEnqueuer";
import type { Message } from "./types";

export class AilaChat implements AilaChatService {
  private readonly _id: string;
  private readonly _messages: Message[];
  private _relevantLessons: AilaRagRelevantLesson[];
  private _isShared: boolean | undefined;
  private readonly _userId: string | undefined;
  private readonly _aila: AilaServices;
  private _generation?: AilaGeneration;
  private _chunks?: string[];
  private readonly _patchEnqueuer: PatchEnqueuer;
  private readonly _llmService: LLMService;
  private readonly _promptBuilder: AilaPromptBuilder;
  private _iteration: number | undefined;
  private _createdAt: Date | undefined;
  private _persistedChat: AilaPersistedChat | undefined;

  constructor({
    id,
    userId,
    messages,
    aila,
    llmService,
    promptBuilder,
  }: {
    id: string;
    userId: string | undefined;
    messages?: Message[];
    aila: AilaServices;
    llmService?: LLMService;
    promptBuilder?: AilaPromptBuilder;
  }) {
    this._id = id;
    this._userId = userId;
    this._messages = messages ?? [];
    this._aila = aila;
    this._llmService =
      llmService ??
      new OpenAIService({
        userId,
        chatId: id,
      });
    this._patchEnqueuer = new PatchEnqueuer();
    this._promptBuilder = promptBuilder ?? new AilaLessonPromptBuilder(aila);
    this._relevantLessons = [];
  }

  public get aila() {
    return this._aila;
  }

  public get id(): string {
    return this._id;
  }

  public get userId(): string | undefined {
    return this._userId;
  }

  public get isShared(): boolean | undefined {
    return this._isShared;
  }

  public get iteration() {
    return this._iteration;
  }

  public get createdAt() {
    return this._createdAt;
  }

  public get messages() {
    return this._messages;
  }

  public get parsedMessages() {
    return this._messages.map((m) => parseMessageParts(m.content));
  }

  public get persistedChat() {
    return this._persistedChat;
  }

  public get relevantLessons() {
    return this._relevantLessons;
  }

  public set relevantLessons(lessons: AilaRagRelevantLesson[]) {
    this._relevantLessons = lessons;
  }

  public getPatchEnqueuer(): PatchEnqueuer {
    return this._patchEnqueuer;
  }

  public addMessage(message: Message) {
    this._messages.push(message);
  }

  public appendChunk(value?: string) {
    invariant(this._chunks, "Chunks not initialised");
    if (!value) {
      return;
    }
    this._chunks.push(value);
  }

  public async generationFailed(error: unknown) {
    invariant(this._generation, "Generation not initialised");
    this.aila.errorReporter?.reportError(
      error,
      "Error reading from the OpenAI stream",
      "info",
    );
    if (error instanceof Error) {
      await this.reportError({ message: error.message });
    }
    await this.persistGeneration("FAILED");
  }

  private async reportError({ message }: { message: string }) {
    await this.enqueue({
      type: "error",
      message,
      value: "Sorry, an error occurred. Please try again.",
    });
  }

  public systemMessage() {
    invariant(this._generation?.systemPrompt, "System prompt not initialised");
    return {
      id: generateMessageId({ role: "system" }),
      content: this._generation?.systemPrompt,
      role: "system" as const,
    };
  }

  public completionMessages() {
    const reducedMessages = this._promptBuilder.reduceMessagesForPrompt(
      this._messages,
    );

    const systemMessage = this.systemMessage();
    const applicableMessages: Message[] = [systemMessage, ...reducedMessages]; // only send

    if (this._aila?.lesson.hasSetInitialState) {
      applicableMessages.push({
        id: generateMessageId({ role: "user" }),
        role: "user",
        content:
          "Now that you have the title, key stage and subject, let's start planning the lesson. Could you tell me if there are Oak lessons I could base my lesson on, or if there are none available let's get going with the first step of the lesson plan creation process!",
      });
    }
    return applicableMessages;
  }

  // #TODO this is the other part of the initial lesson state setting logic
  // This should be some kind of hook that is specific to the
  // generation of lessons rather than being applicable to all
  // chats so that we can generate different types of document
  async handleSettingInitialState() {
    if (this._aila.lesson.hasSetInitialState) {
      // #TODO sending these events in a different place to where they are set seems like a bad idea
      const plan = this._aila.lesson.plan;
      const keys = Object.keys(plan) as Array<keyof typeof plan>;
      for (const key of keys) {
        const value = plan[key];
        if (value) {
          await this.enqueuePatch(`/${key}`, value);
        }
      }
    }
  }

  private warningAboutSubject() {
    const { subject } = this._aila.lesson.plan;
    if (!subject || this.messages.length > 2) {
      return;
    }
    if (!subjects.includes(subject)) {
      return subjectWarnings.unknownSubject;
    }
    if (unsupportedSubjects.includes(subject)) {
      return subjectWarnings.unsupportedSubject;
    }
  }

  /* If the subject is not supported by Oak,
    send a warning message before the first completion */

  // #TODO This is specific to lesson plan generation
  // We should move this to a hook in the generation process
  // so that we can generate other types of document
  public async handleSubjectWarning() {
    const warning = this.warningAboutSubject();
    if (!warning) {
      return;
    }
    await this.enqueue({ type: "prompt", message: warning });
  }

  public async enqueue(message: JsonPatchDocumentOptional) {
    // Optional "?" Necessary to avoid a "terminated" error
    if (this?._patchEnqueuer) {
      await this._patchEnqueuer.enqueueMessage(message);
    }
  }

  public async enqueuePatch(
    path: string,
    value: string | string[] | number | object,
  ) {
    // Optional "?" necessary to avoid a "terminated" error
    if (this?._patchEnqueuer) {
      await this._patchEnqueuer.enqueuePatch(path, value);
    }
  }

  private async startNewGeneration() {
    const systemPrompt = await this._promptBuilder.build();
    this._generation = new AilaGeneration({
      aila: this._aila,
      chat: this,
      id: `${this.id ?? "aila-generation"}-${Date.now()}`,
      systemPrompt,
      status: "PENDING",
    });
    await this._generation.setupPromptId();
    this._chunks = [];
  }

  private accumulatedText() {
    const accumulated = this._chunks?.join("");
    return accumulated ?? "";
  }

  private async reportUsageMetrics() {
    await this._aila.analytics?.reportUsageMetrics(this.accumulatedText());
  }

  private async persistGeneration(status: AilaGenerationStatus) {
    invariant(this._generation, "Generation not initialised");

    if (status === "SUCCESS") {
      const responseText = this.accumulatedText();
      invariant(responseText, "Response text not set");
      await this._generation.complete({ status, responseText });
    }
    await this._generation.persist(status);
  }

  private async persistChat() {
    await Promise.all(
      (this._aila.persistence ?? []).map((p) => p.upsertChat()),
    );
  }

  /**
   * This method attempts to load the chat from the chosen store.
   * Applicable properties from the loaded chat are then set on the chat
   * instance.
   * @throws {AilaError} If the persistence feature is not found
   * @throws {AilaAuthenticationError} If the chat does not belong to the user
   *
   */
  public async loadChat({ store }: { store: string }) {
    const persistenceFeature = this._aila.persistence?.find(
      (p) => p.name === store,
    );

    if (!persistenceFeature) {
      throw new AilaError(`Persistence feature ${store} not found`);
    }

    const persistedChat = await persistenceFeature.loadChat();

    if (persistedChat) {
      this._relevantLessons = persistedChat.relevantLessons ?? [];
      this._isShared = persistedChat.isShared;
      this._iteration = persistedChat.iteration ?? 1;
      this._createdAt = new Date(persistedChat.createdAt);
      this._persistedChat = persistedChat;
    }
  }

  private applyEdits() {
    const patches = this.accumulatedText();
    if (!patches) {
      return;
    }
    this._aila.lesson.applyPatches(patches);
  }

  private appendAssistantMessage() {
    const content = this.accumulatedText();
    const assistantMessage: Message = {
      id: generateMessageId({ role: "assistant" }),
      role: "assistant",
      content,
    };
    this.addMessage(assistantMessage);

    return assistantMessage;
  }

  private async enqueueMessageId(messageId: string) {
    await this.enqueue({
      type: "id",
      value: messageId,
    });
  }

  public async createChatCompletionStream(messages: Message[]) {
    return this._llmService.createChatCompletionStream({
      model: this._aila.options.model ?? DEFAULT_MODEL,
      messages,
      temperature: this._aila.options.temperature ?? DEFAULT_TEMPERATURE,
    });
  }

  public async createChatCompletionObjectStream(messages: Message[]) {
    return this._llmService.createChatCompletionObjectStream({
      model: this._aila.options.model ?? DEFAULT_MODEL,
      schema: LLMMessageSchema,
      schemaName: "response",
      messages,
      temperature: this._aila.options.temperature ?? DEFAULT_TEMPERATURE,
    });
  }

  public async complete() {
    await this.reportUsageMetrics();
    this.applyEdits();
    const assistantMessage = this.appendAssistantMessage();
    await this.enqueueMessageId(assistantMessage.id);
    await Promise.all([
      this.saveSnapshot({ messageId: assistantMessage.id }),
      this.moderate(),
    ]);
    await Promise.all([this.persistChat(), this.persistGeneration("SUCCESS")]);
    await this.enqueue({
      type: "comment",
      value: "CHAT_COMPLETE",
    });
  }

  public async saveSnapshot({ messageId }: { messageId: string }) {
    await this._aila.snapshotStore.saveSnapshot({
      messageId,
      lessonPlan: this._aila.lesson.plan,
      trigger: "ASSISTANT_MESSAGE",
    });
  }

  public async moderate() {
    if (this._aila.options.useModeration) {
      invariant(this._aila.moderation, "Moderation not initialised");
      // #TODO there seems to be a bug or a delay
      // in the streaming logic, which means that
      // the call to the moderation service
      // locks up the stream until it gets a response,
      // leaving the previous message half-sent until then.
      // Since the front end relies on MODERATION_START
      // to appear in the stream, we need to send two
      // comment messages to ensure that it is received.
      await this.enqueue({
        type: "comment",
        value: "MODERATION_START",
      });
      await this.enqueue({
        type: "comment",
        value: "MODERATING",
      });
      const message = await this._aila.moderation.moderate({
        lessonPlan: this._aila.lesson.plan,
        messages: this._aila.messages,
        pluginContext: {
          aila: this._aila,
          enqueue: this.enqueue.bind(this),
        },
      });
      await this.enqueue(message);
    }
  }

  public async setupGeneration() {
    await this.startNewGeneration();
    await this.persistGeneration("REQUESTED");
  }

  public startStreaming(abortController?: AbortController): ReadableStream {
    const streamHandler = new AilaStreamHandler(this);
    return streamHandler.startStreaming(abortController);
  }
}

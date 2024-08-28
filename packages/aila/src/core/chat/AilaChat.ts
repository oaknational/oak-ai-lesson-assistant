import {
  subjects,
  unsupportedSubjects,
  subjectWarnings,
} from "@oakai/core/src/utils/subjects";
import { nanoid } from "nanoid";
import invariant from "tiny-invariant";

import { AilaChatService, AilaServices } from "../..";
import { DEFAULT_MODEL, DEFAULT_TEMPERATURE } from "../../constants";
import {
  AilaGeneration,
  AilaGenerationStatus,
} from "../../features/generation";
import { JsonPatchDocumentOptional } from "../../protocol/jsonPatchProtocol";
import { LLMService } from "../llm/LLMService";
import { OpenAIService } from "../llm/OpenAIService";
import { AilaPromptBuilder } from "../prompt/AilaPromptBuilder";
import { AilaLessonPromptBuilder } from "../prompt/builders/AilaLessonPromptBuilder";
import { AilaStreamHandler } from "./AilaStreamHander";
import { PatchEnqueuer } from "./PatchEnqueuer";
import { Message } from "./types";

export class AilaChat implements AilaChatService {
  private _id: string;
  private _messages: Message[];
  private _userId: string | undefined;
  private _aila: AilaServices;
  private _generation?: AilaGeneration;
  private _chunks?: string[];
  private _patchEnqueuer: PatchEnqueuer;
  private _llmService: LLMService;
  private _promptBuilder: AilaPromptBuilder;

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
  }

  public get aila() {
    return this._aila;
  }

  public get id(): string {
    return this._id;
  }

  public set id(value: string) {
    this._id = value;
    this._aila.analytics?.initialiseAnalyticsContext();
  }

  public get userId(): string | undefined {
    return this._userId;
  }

  public get messages() {
    return this._messages;
  }

  public getPatchEnqueuer(): PatchEnqueuer {
    return this._patchEnqueuer;
  }

  public addMessage(message: Message) {
    this._messages.push(message);
  }

  public async appendChunk(value?: Uint8Array) {
    invariant(this._chunks, "Chunks not initialised");
    if (!value) {
      return;
    }
    const decoded = new TextDecoder().decode(value);
    this._chunks.push(decoded);
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

  public async systemMessage() {
    invariant(this._generation?.systemPrompt, "System prompt not initialised");
    return {
      id: nanoid(16),
      content: this._generation?.systemPrompt,
      role: "system" as const,
    };
  }

  public async completionMessages() {
    const reducedMessages = this._promptBuilder.reduceMessagesForPrompt(
      this._messages,
    );

    const systemMessage = await this.systemMessage();
    const applicableMessages: Message[] = [systemMessage, ...reducedMessages]; // only send

    if (this._aila?.lesson.hasSetInitialState) {
      applicableMessages.push({
        id: nanoid(16),
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
    await this._patchEnqueuer.enqueueMessage(message);
  }

  public async enqueuePatch(path: string, value: unknown) {
    await this._patchEnqueuer.enqueuePatch(path, value);
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
    this._generation.setupPromptId();
    this._chunks = [];
  }

  private accumulatedText() {
    const accumulated = this._chunks?.join("");
    return accumulated;
  }

  private async reportUsageMetrics() {
    await this._aila.analytics?.reportUsageMetrics(
      this.accumulatedText() ?? "",
    );
  }

  private async persistGeneration(status: AilaGenerationStatus) {
    invariant(this._generation, "Generation not initialised");

    if (status === "SUCCESS") {
      const responseText = this.accumulatedText();
      invariant(responseText, "Response text not set");
      await this._generation.complete({ status, responseText });
    }
    this._generation.persist(status);
  }

  private async persistChat() {
    await Promise.all(
      (this._aila.persistence ?? []).map((p) => p.upsertChat()),
    );
  }

  private applyEdits() {
    const patches = this.accumulatedText();
    console.log("Apply edits", patches);
    if (!patches) {
      return;
    }
    this._aila.lesson.applyPatches(patches);
  }

  private appendAssistantMessage() {
    const content = this.accumulatedText();
    if (!content) {
      return;
    }
    const assistantMessage: Message = {
      id: nanoid(16),
      role: "assistant",
      content,
    };
    this.addMessage(assistantMessage);
  }

  private async enqueueFinalState() {
    await this.enqueue({
      type: "state",
      reasoning: "final",
      value: this._aila.lesson.plan,
    });
  }

  public async createChatCompletionStream(messages: Message[]) {
    return this._llmService.createChatCompletionStream({
      model: this._aila.options.model ?? DEFAULT_MODEL,
      messages,
      temperature: this._aila.options.temperature ?? DEFAULT_TEMPERATURE,
    });
  }

  public async complete() {
    await this.reportUsageMetrics();
    this.applyEdits();
    this.appendAssistantMessage();
    await this.moderate();
    await this.enqueueFinalState();
    await this.persistChat();
    await this.persistGeneration("SUCCESS");
  }

  public async moderate() {
    if (this._aila.options.useModeration) {
      invariant(this._aila.moderation, "Moderation not initialised");
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
    await this.persistChat();
    await this.persistGeneration("REQUESTED");
  }

  public startStreaming(abortController?: AbortController): ReadableStream {
    const streamHandler = new AilaStreamHandler(this);
    return streamHandler.startStreaming(abortController);
  }
}

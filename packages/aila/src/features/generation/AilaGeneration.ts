import { PromptVariants } from "@oakai/core/src/models/promptVariants";
import { ailaGenerate } from "@oakai/core/src/prompts/lesson-assistant/variants";
import { prisma, Prompt } from "@oakai/db";
import { getEncoding } from "js-tiktoken";

import { AilaServices } from "../../core";
import { AilaChat } from "../../core/chat";
import { AilaGenerationStatus } from "./types";

export class AilaGeneration {
  private _aila: AilaServices;
  private _id: string;
  private _chat: AilaChat;
  private _status: AilaGenerationStatus = "PENDING";
  private _startedAt?: Date;
  private _completedAt?: Date;
  private _responseText?: string;
  private _modelEncoding = getEncoding("cl100k_base");
  private _promptTokens: number = 0;
  private _completionTokens: number = 0;
  private _totalTokens: number = 0;
  private _systemPrompt: string = "";
  private _promptId: string | null = null;

  constructor({
    aila,
    id,
    status,
    chat,
    systemPrompt,
    promptId,
  }: {
    aila: AilaServices;
    id: string;
    status: AilaGenerationStatus;
    chat: AilaChat;
    systemPrompt: string;
    promptId?: string;
  }) {
    this._id = id;
    this._status = status;
    this._chat = chat;
    this._startedAt = new Date();
    this._systemPrompt = systemPrompt;
    this._aila = aila;
    if (promptId) {
      this._promptId = promptId;
    }
  }

  async complete({
    status,
    responseText,
  }: {
    status: AilaGenerationStatus;
    responseText: string;
  }) {
    this._status = status;
    this._completedAt = new Date();
    this._responseText = responseText;
    await this.calculateTokenUsage();
  }

  get id() {
    return this._id;
  }

  set id(newId) {
    this._id = newId;
  }

  get chat() {
    return this._chat;
  }

  public async setupPromptId(): Promise<string | null> {
    if (!this._promptId) {
      this._promptId = await this.fetchPromptId();
    }
    return this._promptId;
  }

  get promptId() {
    return this._promptId;
  }

  get responseText() {
    return this._responseText;
  }

  get status() {
    return this._status;
  }

  get systemPrompt() {
    return this._systemPrompt;
  }

  get tokenUsage() {
    return {
      promptTokens: this._promptTokens,
      completionTokens: this._completionTokens,
      totalTokens: this._totalTokens,
    };
  }

  get startedAt() {
    return this._startedAt;
  }

  get completedAt() {
    return this._completedAt;
  }

  get queryDuration() {
    if (!this._completedAt || !this._startedAt) {
      return 0;
    }
    return this._completedAt.getTime() - this._startedAt.getTime();
  }

  set status(status: AilaGenerationStatus) {
    this._status = status;
  }

  async persist(status: AilaGenerationStatus) {
    this._status = status;
    await Promise.all(
      (this._aila.persistence ?? []).map((p) => p.upsertGeneration(this)),
    );
  }

  private async calculateTokenUsage(): Promise<void> {
    if (!this._responseText) {
      return;
    }
    this._promptTokens = this._chat.messages.reduce((acc, message) => {
      return acc + this._modelEncoding.encode(message.content).length;
    }, 0);
    this._completionTokens = this._modelEncoding.encode(
      this._responseText,
    ).length;
    this._totalTokens = this._promptTokens + this._completionTokens;
  }

  private async fetchPromptId(): Promise<string | null> {
    const appSlug = "lesson-planner";
    const promptSlug = "generate-lesson-plan";
    const responseMode = "interactive";
    const basedOn = !!this._aila.lesson.plan.basedOn;
    const useRag = this._aila.options.useRag ?? true;

    // This key is defined in the setupPrompts script in core
    const variantSlug = `${responseMode}-${basedOn ? "basedOn" : "notBasedOn"}-${useRag ? "rag" : "noRag"}`;

    let prompt: Prompt | null = null;
    prompt = await prisma.prompt.findFirst({
      where: {
        variant: variantSlug,
        appId: appSlug,
        slug: promptSlug,
      },
    });
    if (!prompt) {
      // If the prompt does not exist for this variant, we need to generate it
      const prompts = new PromptVariants(prisma, ailaGenerate, promptSlug);
      prompts.setCurrent(variantSlug, true);
      prompt = await prisma.prompt.findFirst({
        where: {
          variant: variantSlug,
          appId: appSlug,
          slug: promptSlug,
        },
      });
    }
    if (!prompt) {
      throw new Error(
        "Prompt not found - please run pnpm prompts or pnpm prompts:dev in development",
      );
    }
    return prompt?.id;
  }
}

import { PromptVariants } from "@oakai/core/src/models/promptVariants";
import {
  ailaGenerate,
  generateAilaPromptVersionVariantSlug,
} from "@oakai/core/src/prompts/lesson-assistant/variants";
import type { Prompt } from "@oakai/db";
import { prisma } from "@oakai/db/client";
import { aiLogger } from "@oakai/logger";
import { kv } from "@vercel/kv";
import { getEncoding } from "js-tiktoken";

import type { AilaServices } from "../../core/AilaServices";
import type { AilaChat } from "../../core/chat";
import type { AilaGenerationStatus } from "./types";

const log = aiLogger("generation");

export class AilaGeneration {
  private readonly _aila: AilaServices;
  private _id: string;
  private readonly _chat: AilaChat;
  private _status: AilaGenerationStatus = "PENDING";
  private readonly _startedAt?: Date;
  private _completedAt?: Date;
  private _responseText?: string;
  private readonly _modelEncoding = getEncoding("cl100k_base");
  private _promptTokens: number = 0;
  private _completionTokens: number = 0;
  private _totalTokens: number = 0;
  private readonly _systemPrompt: string = "";
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

  complete({
    status,
    responseText,
  }: {
    status: AilaGenerationStatus;
    responseText: string;
  }) {
    this._status = status;
    this._completedAt = new Date();
    this._responseText = responseText;
    this.calculateTokenUsage();
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

  public async setupPromptId(): Promise<string> {
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

  private calculateTokenUsage() {
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

  private async fetchPromptId(): Promise<string> {
    const appSlug = "lesson-planner";
    const promptSlug = "generate-lesson-plan";
    const responseMode = "interactive";
    const basedOn = !!this._aila.document.plan.basedOn;
    const useRag = this._aila.options.useRag ?? true;

    const variantSlug = generateAilaPromptVersionVariantSlug(
      responseMode,
      basedOn,
      useRag,
    );

    let prompt: Prompt | null = null;
    let promptId: string | undefined = undefined;

    if (
      process.env.NODE_ENV === "production" &&
      process.env.VERCEL_GIT_COMMIT_SHA
    ) {
      const cacheKey = `prompt:${appSlug}:${promptSlug}:${variantSlug}:${process.env.VERCEL_GIT_COMMIT_SHA}`;
      prompt = await kv.get(cacheKey);

      if (!prompt) {
        prompt = await prisma.prompt.findFirst({
          where: {
            variant: variantSlug,
            appId: appSlug,
            slug: promptSlug,
            current: true,
          },
        });

        if (prompt) {
          // We can't use Prisma Accelerate to cache the result
          // Because we need to ensure that each deployment
          // we have fresh prompt data if the prompt has been updated
          // Instead, use KV to cache the result for 5 minutes
          await kv.set(cacheKey, prompt, { ex: 60 * 5 });
        }
      }
    } else {
      const promptQuery = {
        where: {
          variant: variantSlug,
          appId: appSlug,
          slug: promptSlug,
          current: true,
        },
      };
      prompt = await prisma.prompt.findFirst(promptQuery);
    }
    if (!prompt) {
      // // If the prompt does not exist for this variant, we can try to generate it
      try {
        const prompts = new PromptVariants(prisma, ailaGenerate, promptSlug);
        const created = await prompts.setCurrent(variantSlug, true);
        promptId = created?.id;
      } catch (e) {
        log.error("Error creating prompt", e);
      }
    }

    promptId = promptId ?? prompt?.id;
    if (!promptId) {
      throw new Error(
        "Prompt not found or created - please run pnpm prompts or pnpm prompts:dev in development",
      );
    }
    return promptId;
  }
}

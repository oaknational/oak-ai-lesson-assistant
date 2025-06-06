import { Moderations } from "@oakai/core/src/models/moderations";
import {
  getCategoryGroup,
  getMockModerationResult,
  getSafetyResult,
  isToxic,
} from "@oakai/core/src/utils/ailaModeration/helpers";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { Moderation, PrismaClientWithAccelerate } from "@oakai/db";
import { prisma as globalPrisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import invariant from "tiny-invariant";

import type { AilaServices } from "../../core/AilaServices";
import type { Message } from "../../core/chat";
import type { AilaDocumentContent } from "../../core/document/types";
import type { AilaPluginContext } from "../../core/plugins/types";
import { getLastAssistantMessage } from "../../helpers/chat/getLastAssistantMessage";
import type { ModerationDocument } from "../../protocol/jsonPatchProtocol";
import type { AilaModerationFeature } from "../types";
import type { AilaModerator } from "./moderators";
import { OpenAiModerator } from "./moderators/OpenAiModerator";

const log = aiLogger("aila:moderation");

export class AilaModeration implements AilaModerationFeature {
  private readonly _prisma: PrismaClientWithAccelerate;
  private readonly _moderations: Moderations;
  private readonly _moderator: AilaModerator;
  private readonly _aila: AilaServices;
  private readonly _shouldPersist: boolean = true;

  constructor({
    aila,
    prisma,
    moderator,
    moderations,
    shouldPersist = true,
  }: {
    aila: AilaServices;
    prisma?: PrismaClientWithAccelerate;
    moderator?: AilaModerator;
    moderations?: Moderations;
    shouldPersist?: boolean;
  }) {
    log.info("Initializing AilaModeration");
    this._aila = aila;
    this._prisma = prisma ?? globalPrisma;

    this._moderator =
      moderator ??
      new OpenAiModerator({
        chatId: aila.chatId,
        userId: aila.chat.userId,
      });
    this._moderations = moderations ?? new Moderations(this._prisma);
    this._shouldPersist = shouldPersist;
  }

  public async persistModerationResult(
    moderationResult: ModerationResult,
    lastAssistantMessage: Message,
    content: AilaDocumentContent,
  ) {
    const userId = this._aila.userId;
    const chatId = this._aila.chatId;
    invariant(this._shouldPersist, "_shouldPersist required");
    invariant(userId, "userId is required for persisting moderation results");
    invariant(chatId, "chatId is required for persisting moderation results");
    const moderation = await this._moderations.create({
      userId,
      appSessionId: chatId,
      messageId: lastAssistantMessage.id,
      categories: moderationResult.categories,
      scores: moderationResult.scores,
      justification: moderationResult.justification,
      content,
    });

    return moderation;
  }

  public async moderate({
    content,
    messages,
    pluginContext,
  }: {
    content: AilaDocumentContent;
    messages: Message[];
    pluginContext: AilaPluginContext;
  }) {
    log.info("Moderating messages", messages.length);
    if (messages.length === 0) {
      log.info("No messages to moderate, returning default message");
      const defaultMessage: ModerationDocument = {
        type: "moderation",
        categories: [],
      };
      return defaultMessage;
    }
    const lastAssistantMessage = getLastAssistantMessage(messages);
    if (!lastAssistantMessage) {
      const errorText = "Failed to moderate, no assistant message found";
      log.error(errorText);
      throw new Error(errorText);
    }

    const startTime = Date.now();
    const moderationResult: ModerationResult = await this.performModeration({
      messages,
      content,
      retries: 3,
    });
    const moderationDuration = Date.now() - startTime;

    if (this._shouldPersist) {
      const moderation = await this.persistModerationResult(
        moderationResult,
        lastAssistantMessage,
        content,
      );
      this.reportModerationToAnalytics(moderationResult, moderation, moderationDuration);

      if (isToxic(moderationResult)) {
        for (const plugin of this._aila.plugins ?? []) {
          await plugin.onToxicModeration?.(moderation, pluginContext);
        }
      }

      const message: ModerationDocument = {
        type: "moderation",
        categories: moderationResult.categories,
        id: moderation?.id,
      };
      return message;
    }

    const messageWithoutPersistence: ModerationDocument = {
      type: "moderation",
      categories: moderationResult.categories,
    };
    return messageWithoutPersistence;
  }

  public reportModerationToAnalytics(
    moderationResult: ModerationResult,
    moderation: Moderation,
    durationMs?: number,
  ) {
    this._aila.analytics?.reportModerationResult({
      distinctId: this._aila.userId,
      event: "moderation_result",
      properties: {
        chat_id: this._aila.chatId,
        safety: getSafetyResult(moderation),
        category_groups: moderationResult.categories.map(getCategoryGroup),
        categories: moderationResult.categories,
        justification: moderationResult.justification,
        moderation_id: moderation.id,
        duration_ms: durationMs,
      },
    });
  }

  public mockedResponse(messages: Message[]) {
    const lastUserMessage: Message | undefined = messages.findLast(
      (m) => m.role === "user",
    );
    if (lastUserMessage) {
      const mockModerationResult = getMockModerationResult(
        lastUserMessage?.content,
      );
      if (mockModerationResult) {
        log.info("Returning mockModerationResult", mockModerationResult);
        return mockModerationResult;
      }
    }
  }

  public async performModeration({
    messages,
    content,
    retries = 0,
  }: {
    messages: Message[];
    content: AilaDocumentContent;
    retries?: number;
  }): Promise<ModerationResult> {
    log.info("Performing moderation");
    const mockedResponse = this.mockedResponse(messages);
    if (mockedResponse) {
      log.info("Returning mocked response", mockedResponse);
      return mockedResponse;
    } else {
      log.info("No mocked response found. Continuing to moderate");
    }
    const response = await this._moderator.moderate(JSON.stringify(content));
    return (
      response ?? (await this.retryModeration({ messages, content, retries }))
    );
  }

  public async retryModeration({
    messages,
    content,
    retries,
  }: {
    messages: Message[];
    content: AilaDocumentContent;
    retries: number;
  }): Promise<ModerationResult> {
    if (retries < 1) {
      return {
        categories: [],
        scores: undefined,
        justification: "Failed to parse moderation response",
      };
    }

    this._aila.errorReporter?.addBreadcrumb({
      message: "Failed to parse moderation response, retrying",
    });

    return this.performModeration({
      messages,
      content,
      retries: retries - 1,
    });
  }
}

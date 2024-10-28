import { Moderations } from "@oakai/core/src/models/moderations";
import {
  getCategoryGroup,
  getMockModerationResult,
  getSafetyResult,
  isToxic,
} from "@oakai/core/src/utils/ailaModeration/helpers";
import { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import {
  Moderation,
  PrismaClientWithAccelerate,
  prisma as globalPrisma,
} from "@oakai/db";
import { aiLogger } from "@oakai/logger";
import invariant from "tiny-invariant";

import { type AilaServices } from "../../core/AilaServices";
import { Message } from "../../core/chat";
import { AilaPluginContext } from "../../core/plugins/types";
import { getLastAssistantMessage } from "../../helpers/chat/getLastAssistantMessage";
import { ModerationDocument } from "../../protocol/jsonPatchProtocol";
import { LooseLessonPlan } from "../../protocol/schema";
import { AilaModerationFeature } from "../types";
import { AilaModerator } from "./moderators";
import { OpenAiModerator } from "./moderators/OpenAiModerator";

const log = aiLogger("aila:moderation");

export class AilaModeration implements AilaModerationFeature {
  private _prisma: PrismaClientWithAccelerate;
  private _moderations: Moderations;
  private _moderator: AilaModerator;
  private _aila: AilaServices;
  private _shouldPersist: boolean = true;

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
    lessonPlan: LooseLessonPlan,
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
      justification: moderationResult.justification,
      lesson: lessonPlan,
    });

    return moderation;
  }

  public async moderate({
    lessonPlan,
    messages,
    pluginContext,
  }: {
    lessonPlan: LooseLessonPlan;
    messages: Message[];
    pluginContext: AilaPluginContext;
  }) {
    if (messages.length === 0) {
      const defaultMessage: ModerationDocument = {
        type: "moderation",
        categories: [],
      };
      return defaultMessage;
    }
    const lastAssistantMessage = getLastAssistantMessage(messages);
    if (!lastAssistantMessage) {
      throw new Error("Failed to moderate, no assistant message found");
    }

    const moderationResult: ModerationResult = await this.performModeration({
      messages,
      lessonPlan,
      retries: 3,
    });

    if (this._shouldPersist) {
      const moderation = await this.persistModerationResult(
        moderationResult,
        lastAssistantMessage,
        lessonPlan,
      );
      this.reportModerationToAnalytics(moderationResult, moderation);

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
    lessonPlan,
    retries = 0,
  }: {
    messages: Message[];
    lessonPlan: LooseLessonPlan;
    retries?: number;
  }): Promise<ModerationResult> {
    const mockedResponse = this.mockedResponse(messages);
    if (mockedResponse) {
      return mockedResponse;
    }
    const response = await this._moderator.moderate(JSON.stringify(lessonPlan));
    return (
      response ??
      (await this.retryModeration({ messages, lessonPlan, retries }))
    );
  }

  public async retryModeration({
    messages,
    lessonPlan,
    retries,
  }: {
    messages: Message[];
    lessonPlan: LooseLessonPlan;
    retries: number;
  }) {
    if (retries < 1) {
      return {
        categories: [],
        justification: "Failed to parse moderation response",
      };
    }

    this._aila.errorReporter?.addBreadcrumb({
      message: "Failed to parse moderation response, retrying",
    });

    return this.performModeration({
      messages,
      lessonPlan,
      retries: retries - 1,
    });
  }
}

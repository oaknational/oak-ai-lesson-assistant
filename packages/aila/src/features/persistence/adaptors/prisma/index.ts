import { toPrismaJson } from "@oakai/db";
import type { OakPrismaClient } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import { AilaPersistence } from "../..";
import { AilaAuthenticationError } from "../../../../core/AilaError";
import type {
  AilaChatService,
  AilaServices,
} from "../../../../core/AilaServices";
import type {
  AilaPersistedChat,
  LessonPlanKey,
} from "../../../../protocol/schema";
import { migrateChatData } from "../../../../protocol/schemas/versioning/migrateChatData";

const log = aiLogger("aila:persistence");

export class AilaPrismaPersistence extends AilaPersistence {
  private readonly _prisma: OakPrismaClient;

  constructor({
    chat,
    aila,
    prisma,
  }: {
    chat: AilaChatService;
    aila: AilaServices;
    prisma: OakPrismaClient;
  }) {
    super({ chat, name: "AilaPrismaPersistence", aila });
    this._prisma = prisma;
  }

  async loadChat(): Promise<AilaPersistedChat | null> {
    const { id, userId } = this._chat;

    const appSession = await this._prisma.appSession.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!appSession) {
      return null;
    }

    if (userId && userId !== appSession.userId) {
      throw new AilaAuthenticationError("User not authorised to access chat");
    }

    const rawChat = appSession?.output;

    // Migrate lesson plan quizzes and parse in one step
    const parsedChat = await migrateChatData(
      rawChat,
      async (updatedChat) => {
        await this._prisma.appSession.update({
          where: { id },
          data: { output: toPrismaJson(updatedChat) },
        });
      },
      {
        id,
        userId: appSession.userId,
        caller: "prisma.loadChat",
      },
    );

    return parsedChat;
  }

  async upsertChat(): Promise<void> {
    const currentIteration = this._chat.iteration;
    const payload = this.createChatPayload();
    const keys = (Object.keys(payload.lessonPlan) as LessonPlanKey[]).filter(
      (k) => payload.lessonPlan[k],
    );

    if (!payload.id || !payload.userId) {
      log.info("No ID or userId found for chat. Not persisting.");
      return;
    }

    await this._prisma.appSession.upsert({
      where: {
        id: payload.id,
        userId: payload.userId,
      },
      create: {
        id: payload.id,
        userId: payload.userId,
        appId: "lesson-planner",
        output: toPrismaJson(payload),
        createdAt: new Date(),
      },
      update: {
        output: toPrismaJson(payload),
        updatedAt: new Date(),
      },
    });
    log.info(
      `Chat updated from ${currentIteration} to ${payload.iteration}`,
      `${keys.length}`,
      keys.join("|"),
      payload.id,
    );
  }
}

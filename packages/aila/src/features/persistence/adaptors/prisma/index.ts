import type { Prisma, PrismaClientWithAccelerate } from "@oakai/db";
import { prisma as globalPrisma } from "@oakai/db/client";
import { aiLogger } from "@oakai/logger";

import { AilaPersistence } from "../..";
import { AilaAuthenticationError } from "../../../../core/AilaError";
import type {
  AilaChatService,
  AilaServices,
} from "../../../../core/AilaServices";
import type {
  AilaPersistedChat,
  LessonPlanKeys,
} from "../../../../protocol/schema";
import { chatSchema } from "../../../../protocol/schema";
import type { AilaGeneration } from "../../../generation/AilaGeneration";

const log = aiLogger("aila:persistence");

export class AilaPrismaPersistence extends AilaPersistence {
  private _prisma: PrismaClientWithAccelerate;

  constructor({
    chat,
    aila,
    prisma,
  }: {
    chat: AilaChatService;
    aila: AilaServices;
    prisma?: PrismaClientWithAccelerate;
  }) {
    super({ chat, name: "AilaPrismaPersistence", aila });
    this._prisma = prisma ?? globalPrisma;
  }

  async loadChat(): Promise<AilaPersistedChat | null> {
    const { id, userId } = this._chat;

    const appSession = await this._prisma.appSession.findFirst({
      where: {
        id,
      },
    });

    if (!appSession) {
      return null;
    }

    if (userId && userId !== appSession.userId) {
      throw new AilaAuthenticationError("User not authorised to access chat");
    }

    const parsedChat = chatSchema.parse(appSession?.output);

    return parsedChat;
  }

  async upsertChat(): Promise<void> {
    const currentIteration = this._chat.iteration;
    const payload = this.createChatPayload();
    const keys = (Object.keys(payload.lessonPlan) as LessonPlanKeys[]).filter(
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
        output: payload,
        createdAt: new Date(),
      },
      update: {
        output: payload,
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

  async upsertGeneration(generation?: AilaGeneration): Promise<void> {
    if (!generation) return;

    const payload = this.createGenerationPayload(generation);
    if (!payload.id || !payload.userId) {
      log.info(
        "No ID or userId found for generation. Not persisting.",
        generation.id,
      );
      return;
    }

    if (payload.id) {
      const updatePayload: Prisma.GenerationUpdateInput = {
        status: payload.status,
        response: payload.response,
        completedAt: payload.completedAt,
        llmTimeTaken: payload.llmTimeTaken,
      };
      if (payload.messageId) {
        // Only update messageId if it exists
        updatePayload.messageId = payload.messageId;
      }
      await this._prisma.generation.upsert({
        where: {
          id: payload.id,
          userId: payload.userId,
        },
        create: payload,
        update: updatePayload,
      });
    } else {
      const result = await this._prisma.generation.create({
        data: payload,
      });
      generation.id = result.id;
    }
  }
}

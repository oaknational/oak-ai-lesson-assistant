import {
  Prisma,
  PrismaClientWithAccelerate,
  prisma as globalPrisma,
} from "@oakai/db";

import { AilaPersistence } from "../..";
import {
  AilaAuthenticationError,
  AilaChatService,
  AilaServices,
} from "../../../../core";
import { AilaPersistedChat, chatSchema } from "../../../../protocol/schema";
import { AilaGeneration } from "../../../generation";

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

    console.log("appSession", appSession?.id, appSession?.userId);

    if (!appSession) {
      return null;
    }

    console.log("userId", userId);

    if (userId && userId !== appSession.userId) {
      throw new AilaAuthenticationError("User not authorised to access chat");
    }

    const parsedChat = chatSchema.parse(appSession?.output);

    return parsedChat;
  }

  async upsertChat(): Promise<void> {
    const payload = this.createChatPayload();
    if (!payload.id || !payload.userId) {
      console.log("No ID or userId found for chat. Not persisting.");
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
      },
      update: { output: payload },
    });
  }

  async upsertGeneration(generation?: AilaGeneration): Promise<void> {
    if (!generation) return;

    const payload = this.createGenerationPayload(generation);
    if (!payload.id || !payload.userId) {
      console.log(
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

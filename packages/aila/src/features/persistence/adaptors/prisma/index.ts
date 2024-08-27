import { PrismaClientWithAccelerate, prisma as globalPrisma } from "@oakai/db";

import { AilaPersistence } from "../..";
import { AilaChatService, AilaServices } from "../../../../core";
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

  async upsertChat(): Promise<void> {
    const payload = this.createChatPayload();
    if (!payload.id || !payload.userId) {
      console.log("No ID or userId found for chat. Not persisting.");
      return;
    }

    await this._prisma.appSession.upsert({
      where: { id: payload.id },
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
      await this._prisma.generation.upsert({
        where: { id: payload.id },
        create: payload,
        update: {
          status: payload.status,
          response: payload.response,
          completedAt: payload.completedAt,
          llmTimeTaken: payload.llmTimeTaken,
        },
      });
    } else {
      const result = await this._prisma.generation.create({
        data: payload,
      });
      generation.id = result.id;
    }
  }
}

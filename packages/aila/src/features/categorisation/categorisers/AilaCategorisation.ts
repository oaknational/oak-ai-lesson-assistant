import { RAG } from "@oakai/core/src/rag";
import {
  type PrismaClientWithAccelerate,
  prisma as globalPrisma,
} from "@oakai/db";

import type { AilaServices, Message } from "../../../core";
import type { LooseLessonPlan } from "../../../protocol/schema";
import type { AilaCategorisationFeature } from "../../types";

export class AilaCategorisation implements AilaCategorisationFeature {
  private _aila: AilaServices;
  private _prisma: PrismaClientWithAccelerate;
  private _chatId: string;
  private _userId: string | undefined;
  constructor({
    aila,
    prisma,
    chatId,
    userId,
  }: {
    aila: AilaServices;
    prisma?: PrismaClientWithAccelerate;
    chatId: string;
    userId?: string;
  }) {
    this._aila = aila;
    this._prisma = prisma ?? globalPrisma;
    this._chatId = chatId;
    this._userId = userId;
  }
  public async categorise(
    messages: Message[],
    lessonPlan: LooseLessonPlan,
  ): Promise<LooseLessonPlan | undefined> {
    const { title, subject, keyStage, topic } = lessonPlan;
    const input = messages.map((i) => i.content).join("\n\n");
    const categorisationInput = [title, subject, keyStage, topic, input]
      .filter((i) => i)
      .join(" ");

    const result = await this.fetchCategorisedInput(
      categorisationInput,
      this._prisma,
    );
    return result;
  }

  private async fetchCategorisedInput(
    input: string,
    prisma: PrismaClientWithAccelerate,
  ): Promise<LooseLessonPlan | undefined> {
    const rag = new RAG(prisma, {
      chatId: this._chatId,
      userId: this._userId,
    });
    const parsedCategorisation = await rag.categoriseKeyStageAndSubject(input, {
      chatId: this._chatId,
      userId: this._userId,
    });
    const { keyStage, subject, title, topic } = parsedCategorisation;
    const plan: LooseLessonPlan = {
      keyStage: keyStage ?? undefined,
      subject: subject ?? undefined,
      title: title ?? undefined,
      topic: topic ?? undefined,
    };
    return plan;
  }
}

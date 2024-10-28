import { LessonSnapshots } from "@oakai/core/src/models/lessonSnapshots";
import { type PrismaClientWithAccelerate } from "@oakai/db";
import { prisma as globalPrisma } from "@oakai/db/client";
import { LessonSnapshotTrigger } from "@prisma/client";
import invariant from "tiny-invariant";

import { type AilaServices } from "../../core/AilaServices";
import { LooseLessonPlan } from "../../protocol/schema";

export class AilaSnapshotStore {
  protected _name: string;
  protected _aila: AilaServices;
  private _prisma: PrismaClientWithAccelerate;

  constructor({
    name = "AilaSnapshotStore",
    aila,
    prisma,
  }: {
    name?: string;
    aila: AilaServices;
    prisma?: PrismaClientWithAccelerate;
  }) {
    this._name = name;
    this._aila = aila;
    this._prisma = prisma ?? globalPrisma;
  }

  get name() {
    return this._name;
  }

  public async saveSnapshot({
    messageId,
    lessonPlan,
    trigger,
  }: {
    messageId: string;
    lessonPlan: LooseLessonPlan;
    trigger: LessonSnapshotTrigger;
  }) {
    invariant(this._aila.userId, "userId is required for saving snapshots");

    const lessonSnapshots = new LessonSnapshots(this._prisma);
    await lessonSnapshots.create({
      userId: this._aila.userId,
      chatId: this._aila.chatId,
      snapshot: lessonPlan,
      messageId,
      trigger,
    });
  }
}

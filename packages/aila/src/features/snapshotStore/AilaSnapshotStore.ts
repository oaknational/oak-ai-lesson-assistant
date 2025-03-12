import { LessonSnapshots } from "@oakai/core/src/models/lessonSnapshots";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { prisma as globalPrisma } from "@oakai/db/client";

import type { LessonSnapshotTrigger } from "@prisma/client";
import invariant from "tiny-invariant";

import type { AilaServices } from "../../core/AilaServices";
import type { AilaDocumentContent } from "../../core/document/types";

export class AilaSnapshotStore {
  protected _name: string;
  protected _aila: AilaServices;
  private readonly _prisma: PrismaClientWithAccelerate;

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
    content,
    trigger,
  }: {
    messageId: string;
    content: AilaDocumentContent;
    trigger: LessonSnapshotTrigger;
  }) {
    invariant(this._aila.userId, "userId is required for saving snapshots");

    const lessonSnapshots = new LessonSnapshots(this._prisma);
    await lessonSnapshots.create({
      userId: this._aila.userId,
      chatId: this._aila.chatId,
      snapshot: content,
      messageId,
      trigger,
    });
  }
}

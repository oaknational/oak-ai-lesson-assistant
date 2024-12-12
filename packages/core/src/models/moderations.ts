import type { Moderation, PrismaClientWithAccelerate } from "@oakai/db";

import type { ModerationResult } from "../utils/ailaModeration/moderationSchema";
import type { Snapshot } from "./lessonSnapshots";
import { LessonSnapshots } from "./lessonSnapshots";

/**
 * By default, only moderations which haven't been invalidated returned by this API
 */
export class Moderations {
  constructor(private readonly prisma: PrismaClientWithAccelerate) {
    this.lessonSnapshots = new LessonSnapshots(prisma);
  }

  lessonSnapshots: LessonSnapshots;

  async byAppSessionId(
    appSessionId: string,
    { includeInvalidated }: { includeInvalidated?: boolean },
  ): Promise<Moderation[]> {
    return this.prisma.moderation.findMany({
      where: {
        appSessionId,
        invalidatedAt: includeInvalidated ? undefined : null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async create({
    userId,
    appSessionId,
    messageId,
    categories,
    scores,
    justification,
    lesson,
  }: {
    userId: string;
    appSessionId: string;
    messageId: string;
    categories: ModerationResult["categories"];
    scores: ModerationResult["scores"];
    justification?: string;
    lesson: Snapshot;
  }): Promise<Moderation> {
    const { id: lessonSnapshotId } =
      await this.lessonSnapshots.getOrSaveSnapshot({
        userId,
        chatId: appSessionId,
        messageId,
        snapshot: lesson,
        trigger: "MODERATION",
      });

    return this.prisma.moderation.create({
      data: {
        userId,
        categories,
        justification,
        scores,
        appSessionId,
        messageId,
        lessonSnapshotId,
      },
    });
  }

  async invalidateModeration({
    moderationId,
    invalidatedBy,
  }: {
    moderationId: string;
    invalidatedBy: string;
  }): Promise<void> {
    await this.prisma.moderation.update({
      where: {
        id: moderationId,
      },
      data: {
        invalidatedBy,
        invalidatedAt: new Date(),
      },
    });
  }
}

import { Moderation, PrismaClientWithAccelerate } from "@oakai/db";

import { ModerationResult } from "../utils/ailaModeration/moderationSchema";
import { LessonSnapshots, Snapshot } from "./lessonSnapshots";

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
    });
  }

  async create({
    userId,
    appSessionId,
    messageId,
    categories,
    justification,
    lesson,
  }: {
    userId: string;
    appSessionId: string;
    messageId: string;
    categories: ModerationResult["categories"];
    justification?: string;
    lesson: Snapshot;
  }): Promise<Moderation> {
    const lessonSnapshot = await this.lessonSnapshots.createModerationSnapshot({
      userId,
      chatId: appSessionId,
      messageId,
      snapshot: lesson,
    });

    return this.prisma.moderation.create({
      data: {
        userId,
        categories,
        justification,
        appSessionId,
        messageId,
        lessonSnapshotId: lessonSnapshot.id,
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

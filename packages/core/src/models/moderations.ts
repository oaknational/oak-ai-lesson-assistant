import { Moderation, PrismaClientWithAccelerate } from "@oakai/db";

import { ModerationResult } from "../utils/ailaModeration/moderationSchema";
import { LessonSnapshots, Snapshot } from "./lessonSnapshots";

export class Moderations {
  constructor(private readonly prisma: PrismaClientWithAccelerate) {
    this.lessonSnapshots = new LessonSnapshots(prisma);
  }

  lessonSnapshots: LessonSnapshots;

  async byId(moderationId: string): Promise<Moderation | null> {
    return this.prisma.moderation.findFirst({
      where: {
        id: moderationId,
      },
    });
  }

  async getMostRecentBySessionId(
    appSessionId: string,
  ): Promise<Moderation | null> {
    return this.prisma.moderation.findFirst({
      where: {
        appSessionId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async byAppSessionId(appSessionId: string): Promise<Moderation[]> {
    return this.prisma.moderation.findMany({
      where: {
        appSessionId,
      },
    });
  }

  async bySessionAndUserId(
    appSessionId: string,
    userId: string,
  ): Promise<Moderation[]> {
    return this.prisma.moderation.findMany({
      where: {
        appSessionId,
        userId,
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
}

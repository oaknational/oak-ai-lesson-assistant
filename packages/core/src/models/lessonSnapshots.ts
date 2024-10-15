import {
  LessonSnapshot,
  LessonSnapshotTrigger,
  PrismaClientWithAccelerate,
} from "@oakai/db";
import crypto from "crypto";

import {
  LessonPlanJsonSchema,
  LooseLessonPlan,
} from "../../../aila/src/protocol/schema";
// #TODO this import is reaching out of the package because it would otherwise be a circular dependency
import { DeepNullable } from "../utils/DeepNullable";
import { DeepPartial } from "../utils/DeepPartial";

export type Snapshot = DeepPartial<DeepNullable<LooseLessonPlan>>;
const JsonSchemaString = JSON.stringify(LessonPlanJsonSchema);

const LESSON_JSON_SCHEMA_HASH = crypto
  .createHash("sha256")
  .update(JsonSchemaString)
  .digest("hex");

function getSnapshotHash(snapshot: Snapshot) {
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(snapshot))
    .digest("hex");

  return hash;
}

export class LessonSnapshots {
  constructor(private readonly prisma: PrismaClientWithAccelerate) {}

  async byId(lessonSnapshotId: string): Promise<LessonSnapshot | null> {
    return this.prisma.lessonSnapshot.findFirst({
      where: {
        id: lessonSnapshotId,
      },
    });
  }

  async create({
    userId,
    chatId,
    messageId,
    snapshot,
    trigger,
  }: {
    userId: string;
    chatId: string;
    /**
     * This is the message ID of the most recent assistant message
     */
    messageId: string;
    snapshot: Snapshot;
    trigger: LessonSnapshotTrigger;
  }): Promise<LessonSnapshot> {
    const hash = getSnapshotHash(snapshot);

    let lessonSchema = await this.prisma.lessonSchema.findFirst({
      where: {
        hash: LESSON_JSON_SCHEMA_HASH,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!lessonSchema) {
      lessonSchema = await this.prisma.lessonSchema.create({
        data: {
          hash: LESSON_JSON_SCHEMA_HASH,
          jsonSchema: JSON.parse(JsonSchemaString),
        },
      });
    }

    return this.prisma.lessonSnapshot.create({
      data: {
        userId,
        chatId,
        messageId,
        hash,
        lessonJson: snapshot,
        lessonSchemaId: lessonSchema.id,
        trigger,
      },
    });
  }

  async getOrSaveSnapshot({
    userId,
    chatId,
    messageId,
    snapshot,
    trigger,
  }: {
    userId: string;
    chatId: string;
    messageId: string;
    snapshot: Snapshot;
    trigger: LessonSnapshotTrigger;
  }) {
    /**
     * Prisma types complained when passing the JSON schema directly to the Prisma
     */
    const jsonSchema = JSON.parse(JsonSchemaString);
    // get latest lesson schema for given hash
    let lessonSchema = await this.prisma.lessonSchema.findFirst({
      where: {
        hash: LESSON_JSON_SCHEMA_HASH,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!lessonSchema) {
      // create lesson schema if not found
      lessonSchema = await this.prisma.lessonSchema.create({
        data: {
          hash: LESSON_JSON_SCHEMA_HASH,
          jsonSchema,
        },
      });
    }

    const hash = getSnapshotHash(snapshot);

    // attempt to find existing snapshot
    const existingSnapshot = await this.prisma.lessonSnapshot.findFirst({
      where: {
        userId,
        chatId,
        hash,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingSnapshot) {
      return existingSnapshot;
    }

    const lessonSnapshot = await this.prisma.lessonSnapshot.create({
      data: {
        userId,
        chatId,
        messageId,
        lessonSchemaId: lessonSchema.id,
        hash,
        lessonJson: snapshot,
        trigger,
      },
    });

    return lessonSnapshot;
  }
}

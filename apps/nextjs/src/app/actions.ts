"use server";

import {
  AilaRagRelevantLessonSchema,
  LessonPlanSchemaWhilstStreaming,
  type AilaPersistedChat,
} from "@oakai/aila/src/protocol/schema";
import type { Prisma } from "@oakai/db";
import { prisma } from "@oakai/db";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

const chatSchema = z
  .object({
    id: z.string().optional(),
    path: z.string().optional(),
    title: z.string().optional(),
    userId: z.string().optional(),
    lessonPlan: LessonPlanSchemaWhilstStreaming,
    relevantLessons: z.array(AilaRagRelevantLessonSchema).optional(),
    isShared: z.boolean().optional(),
    createdAt: z.union([z.date(), z.number()]).optional(),
    updatedAt: z.union([z.date(), z.number()]).optional(),
    iteration: z.number().optional(),
    startingMessage: z.string().optional(),
    messages: z.array(
      z
        .object({
          id: z.string().optional(),
          content: z.string().optional(),
          role: z
            .union([
              z.literal("function"),
              z.literal("data"),
              z.literal("user"),
              z.literal("system"),
              z.literal("assistant"),
              z.literal("tool"),
            ])
            .optional(),
        })
        .passthrough(),
    ),
  })
  .passthrough();

function parseChatAndReportError({
  sessionOutput,
  id,
  userId,
}: {
  sessionOutput: Prisma.JsonValue;
  id: string;
  userId: string;
}) {
  if (typeof sessionOutput !== "object") {
    throw new Error("sessionOutput is not an object");
  }
  const parseResult = chatSchema.safeParse({
    ...sessionOutput,
    userId,
    id,
  });

  if (!parseResult.success) {
    const error = new Error("Failed to parse chat");
    Sentry.captureException(error, {
      extra: {
        id,
        userId,
        sessionOutput,
        zodError: parseResult.error.flatten(),
      },
    });
  }

  return parseResult.data;
}

export async function getChatById(
  id: string,
): Promise<AilaPersistedChat | null> {
  const session = await prisma?.appSession.findUnique({
    where: { id, deletedAt: null },
  });

  if (!session) {
    return null;
  }
  // @ts-ignore
  return (
    parseChatAndReportError({
      id,
      sessionOutput: session.output,
      userId: session.userId,
    }) ?? null
  );
}

export async function getSharedChatById(
  id: string,
): Promise<AilaPersistedChat | null> {
  const chat = await getChatById(id);

  if (!chat || !chat.isShared) {
    return null;
  }

  return chat;
}

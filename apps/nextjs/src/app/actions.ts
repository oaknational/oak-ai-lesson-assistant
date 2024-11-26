"use server";

import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import { chatSchema } from "@oakai/aila/src/protocol/schema";
import type { Prisma } from "@oakai/db";
import { prisma } from "@oakai/db";
import * as Sentry from "@sentry/nextjs";

function parseChatAndReportError({
  sessionOutput,
  id,
  userId,
}: {
  sessionOutput: Prisma.JsonValue;
  id: string;
  userId: string;
}): AilaPersistedChat | undefined {
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

  return (
    parseChatAndReportError({
      id,
      sessionOutput: session.output,
      userId: session.userId,
    }) || null
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

"use server";

import { auth } from "@clerk/nextjs/server";
import {
  AilaPersistedChat,
  AilaPersistedChatWithMissingMessageIds,
  chatSchema,
  chatSchemaWithMissingMessageIds,
} from "@oakai/aila/src/protocol/schema";
import { Prisma, prisma } from "@oakai/db";
import * as Sentry from "@sentry/nextjs";
import { nanoid } from "nanoid";

function assertChatMessageIdsAreUniqueWithinTheScopeOfThisChat(
  chat: AilaPersistedChatWithMissingMessageIds,
): boolean {
  let updated = false;
  const usedIds = new Set<string>();
  chat.messages = chat.messages.map((message) => {
    if (!message.id || usedIds.has(message.id)) {
      let newId = nanoid(16);
      while (usedIds.has(newId)) {
        newId = nanoid(16);
      }
      message.id = newId;
      updated = true;
    }
    usedIds.add(message.id);
    return message;
  });
  return updated;
}

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
    throw new Error(`sessionOutput is not an object`);
  }
  const parseResult = chatSchemaWithMissingMessageIds.safeParse({
    ...sessionOutput,
    userId,
    id,
  });

  if (!parseResult.success) {
    const error = new Error(`Failed to parse chat`);
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
  let chat: AilaPersistedChatWithMissingMessageIds | undefined = undefined;
  let chatWithMessageIds: AilaPersistedChat | undefined = undefined;

  const session = await prisma?.appSession.findUnique({
    where: { id },
  });

  if (!session) {
    return null;
  }

  chat = parseChatAndReportError({
    id,
    sessionOutput: session.output,
    userId: session.userId,
  });

  if (chat) {
    // Check if messages have IDs. If not, assign them and update the chat.
    // This is a migration step that should be removed after all chats have unique IDs.
    const updated = assertChatMessageIdsAreUniqueWithinTheScopeOfThisChat(chat);

    chatWithMessageIds = chatSchema.parse(chat);
    if (updated) {
      await prisma?.appSession.update({
        where: { id },
        data: { output: chatWithMessageIds },
      });
    }
    return chatWithMessageIds;
  }

  return null;
}

export async function getChatForAuthenticatedUser(
  id: string,
): Promise<AilaPersistedChat | null> {
  const { userId } = auth();

  const chat = await getChatById(id);

  if (!chat) {
    return null;
  }

  const userIsOwner = chat.userId === userId;

  if (!userIsOwner) {
    return null;
  }

  return chat;
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

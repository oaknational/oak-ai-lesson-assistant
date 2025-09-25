"use server";

import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import { migrateChatData } from "@oakai/aila/src/protocol/schemas/versioning/migrateChatData";
import { prisma } from "@oakai/db";

export async function getChatById(
  id: string,
): Promise<AilaPersistedChat | null> {
  const session = await prisma?.appSession.findUnique({
    where: { id, deletedAt: null },
  });

  if (!session) {
    return null;
  }

  const chat = await migrateChatData(
    session.output,
    async (upgradedData) => {
      await prisma.appSession.update({
        where: { id },
        data: { output: upgradedData },
      });
    },
    {
      id: session.id,
      userId: session.userId,
      caller: "actions.getChatById",
    },
  );

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

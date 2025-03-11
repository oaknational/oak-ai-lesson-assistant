import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";

import type { Message } from "ai/react";
import { z } from "zod";

const log = aiLogger("chat");

interface IdPart {
  type: "id";
  value: string;
}

function isIdPart(obj: unknown): obj is IdPart {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "type" in obj &&
    obj.type === "id" &&
    "value" in obj &&
    typeof obj.value === "string"
  );
}

export function findMessageIdFromContent({
  content,
}: {
  content: string;
}): string | undefined {
  return content
    .split("␞")
    .map((s) => {
      try {
        return JSON.parse(s.trim()) as unknown;
      } catch {
        // ignore invalid JSON
        return null;
      }
    })
    .find(isIdPart)?.value;
}

interface StatePart {
  type: "state";
  value: LooseLessonPlan;
}

const statePartSchema = z.object({
  type: z.literal("state"),
  value: z.object({}).passthrough(),
});

export function findLatestServerSideState(
  workingMessages: Message[],
): LooseLessonPlan | undefined {
  log.info("Finding latest server-side state", { workingMessages });
  const lastMessage = workingMessages[workingMessages.length - 1];
  if (!lastMessage?.content.includes('"type":"state"')) {
    log.info("No server state found");
    return undefined;
  }

  const stateParts = lastMessage.content
    .split("␞")
    .map((s) => {
      try {
        const parsed = JSON.parse(s.trim());
        return statePartSchema.safeParse(parsed);
      } catch {
        // ignore invalid JSON
        return { success: false };
      }
    })
    .filter((result): result is z.SafeParseSuccess<StatePart> => result.success)
    .map((result) => result.data);

  const latestState = stateParts[stateParts.length - 1]?.value;

  log.info("Got latest server state", { state: latestState });
  return latestState;
}

export function openSharePage(chat: { id: string }) {
  window.open(constructSharePath(chat), "_blank");
}

export function constructSharePath(chat: { id: string }) {
  return `/aila/${chat.id}/share`;
}

export function constructChatPath(chat: { id: string }) {
  return `/aila/${chat.id}`;
}

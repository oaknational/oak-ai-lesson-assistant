import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import type { Message } from "ai/react";

const log = aiLogger("chat");

interface IdBlock {
  type: "id";
  value: string;
}

function isIdBlock(obj: unknown): obj is IdBlock {
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
    .find(isIdBlock)?.value;
}

export function findLatestServerSideState(workingMessages: Message[]) {
  log.info("Finding latest server-side state", { workingMessages });
  const lastMessage = workingMessages[workingMessages.length - 1];
  if (!lastMessage?.content.includes('"type":"state"')) {
    log.info("No server state found");
    return;
  }
  const state: LooseLessonPlan = lastMessage.content
    .split("␞")
    .map((s) => {
      try {
        return JSON.parse(s.trim());
      } catch {
        // ignore invalid JSON
        return null;
      }
    })
    .filter((i) => i !== null)
    .filter((i) => i.type === "state")
    .map((i) => i.value)[0];
  log.info("Got latest server state", { state });
  return state;
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

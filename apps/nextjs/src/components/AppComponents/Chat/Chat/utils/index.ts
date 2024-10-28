import { type LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import { type Message } from "ai/react";

const log = aiLogger("chat");

export function findMessageIdFromContent({ content }: { content: string }) {
  return content
    .split("␞")
    .map((s) => {
      try {
        return JSON.parse(s.trim());
      } catch (e) {
        // ignore invalid JSON
        return null;
      }
    })
    .find((i) => i?.type === "id")?.value;
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
      } catch (e) {
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

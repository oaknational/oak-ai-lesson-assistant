import { type LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { type Message } from "ai/react";

export function findLatestServerSideState(workingMessages: Message[]) {
  console.log("Finding latest server-side state", { workingMessages });
  const lastMessage = workingMessages[workingMessages.length - 1];
  if (!lastMessage?.content.includes(`"type":"state"`)) {
    console.log("No server state found");
    return;
  }
  const state: LooseLessonPlan = lastMessage.content
    .split(`␞`)
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
  console.log("Got latest server state", { state });
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

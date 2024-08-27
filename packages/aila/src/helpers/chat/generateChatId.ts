import { nanoid } from "nanoid";

export function generateChatId() {
  return `chat-${nanoid(16)}`;
}

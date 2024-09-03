import { nanoid } from "nanoid";

export function generateChatId() {
  return `${nanoid(16)}`;
}

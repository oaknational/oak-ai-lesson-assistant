import { nanoid } from "nanoid";

export function generateMessageId() {
  return `message-${nanoid(16)}`;
}

import { nanoid } from "nanoid";

export function generateMessageId() {
  return `${nanoid(16)}`;
}

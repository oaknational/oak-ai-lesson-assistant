import { nanoid } from "nanoid";

export function generateMessageId({
  role,
}: {
  role: "user" | "assistant" | "system";
}) {
  return `${role[0]}-${nanoid(16)}`;
}

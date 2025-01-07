import { v4 as uuid } from "uuid";

export function generateMessageId({
  role,
}: {
  role: "user" | "assistant" | "system";
}) {
  return `${role[0]}-${uuid()}`;
}

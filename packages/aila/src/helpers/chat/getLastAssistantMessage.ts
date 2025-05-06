import { findLast } from "remeda/dist/commonjs/findLast";

interface HasRole {
  role: string;
  id: string;
}

export function getLastAssistantMessage<T extends HasRole>(
  messages: T[],
): (T & { role: "assistant" }) | undefined {
  return findLast(messages, (m) => m.role === "assistant") as
    | (T & { role: "assistant" })
    | undefined;
}

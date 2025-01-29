interface HasRole {
  role: string;
  id: string;
}

export function getLastAssistantMessage<T extends HasRole>(
  messages: T[],
): (T & { role: "assistant" }) | undefined {
  return messages.filter((m) => m.role === "assistant").pop() as
    | (T & { role: "assistant" })
    | undefined;
}

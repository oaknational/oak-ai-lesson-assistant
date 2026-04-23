interface IdPart {
  type: "id";
  value: string;
}

function isIdPart(obj: unknown): obj is IdPart {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "type" in obj &&
    obj.type === "id" &&
    "value" in obj &&
    typeof obj.value === "string"
  );
}

export function findMessageIdFromContent({
  content,
}: {
  content: string;
}): string | undefined {
  return content
    .split("␞")
    .map((s) => {
      try {
        return JSON.parse(s.trim()) as unknown;
      } catch {
        // ignore invalid JSON
        return null;
      }
    })
    .find(isIdPart)?.value;
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

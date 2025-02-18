import type { MessagePart } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import type { Message as AiMessage } from "ai";
import type { StoreApi } from "zustand";

import type { ChatStore } from ".";

export { AiMessage };

export type ParsedMessage = AiMessage & {
  parts: MessagePart[];
  hasError: boolean;
  isEditing: boolean;
};

export type ChatSetter = StoreApi<ChatStore>["setState"];
export type ChatGetter = StoreApi<ChatStore>["getState"];

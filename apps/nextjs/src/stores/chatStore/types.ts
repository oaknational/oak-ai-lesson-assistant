import type { MessagePart } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import type { Message as AiMessage } from "ai";

export { AiMessage };

export type ParsedMessage = AiMessage & {
  parts: MessagePart[];
  hasError: boolean;
  isEditing: boolean;
};

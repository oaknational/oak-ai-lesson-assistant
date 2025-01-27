import type { MessagePart } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import type { Message as AiMessage } from "ai";

export { AiMessage };

// NOTE: The shape of this type is still in flux
export type ParsedMessage = AiMessage & {
  parts: MessagePart[];
  hasError: boolean;
  isEditing: boolean;
};

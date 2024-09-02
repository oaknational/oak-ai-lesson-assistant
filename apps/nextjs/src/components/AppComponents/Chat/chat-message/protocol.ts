import {
  ActionDocument,
  ModerationDocument,
  PatchDocument,
  type MessagePart,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";

export { parseMessageParts } from "@oakai/aila/src/protocol/jsonPatchProtocol";
export function isPatch(part: MessagePart): part is PatchDocument {
  return part.type === "patch";
}
export function isModeration(part: MessagePart): part is ModerationDocument {
  return part.type === "moderation";
}
export function isAccountLocked(part: MessagePart): part is ActionDocument {
  return part.type === "action" && part.action === "SHOW_ACCOUNT_LOCKED";
}

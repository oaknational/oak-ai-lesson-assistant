import type {
  ActionDocument,
  MessagePartDocument,
  ModerationDocument,
  PatchDocument,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";

export { parseMessageParts } from "@oakai/aila/src/protocol/jsonPatchProtocol";

export function isPatch(part: MessagePartDocument): part is PatchDocument {
  return part.type === "patch";
}
export function isModeration(
  part: MessagePartDocument,
): part is ModerationDocument {
  return part.type === "moderation";
}
export function isAccountLocked(
  part: MessagePartDocument,
): part is ActionDocument {
  return part.type === "action" && part.action === "SHOW_ACCOUNT_LOCKED";
}

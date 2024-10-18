import { extractPatches } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { type Message } from "ai/react";

export function extractPatchesFromMessage(message: Message) {
  const { validPatches, partialPatches } = extractPatches(message.content);
  return { validPatches, partialPatches };
}

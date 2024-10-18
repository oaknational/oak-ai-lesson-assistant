import { extractPatches } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { type Message } from "ai/react";

export function extractPatchesFromMessage(message: Message) {
  const { validPatches, partialPatches } = extractPatches(message.content);
  console.log("Extracted valid patches", validPatches.length);
  return { validPatches, partialPatches };
}

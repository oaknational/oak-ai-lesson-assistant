import { extractPatches } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { aiLogger } from "@oakai/logger";
import type { Message } from "ai/react";

const log = aiLogger("lessons");
export function extractPatchesFromMessage(message: Message) {
  log.info("Extracting patches from message", message);
  const { validPatches, partialPatches } = extractPatches(message.content);
  return { validPatches, partialPatches };
}

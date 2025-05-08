// packages/aila/src/lib/agents/streamHandling.ts
import { aiLogger } from "@oakai/logger";

import { compare } from "fast-json-patch";
import type { ReadableStreamDefaultController } from "stream/web";

import type { AilaChat } from "../../core/chat/AilaChat";
import type { JsonPatchDocumentOptional } from "../../protocol/jsonPatchProtocol";
import type { LooseLessonPlan } from "../../protocol/schema";

const log = aiLogger("aila:agents:stream");

export interface InteractResult {
  document: LooseLessonPlan;
  ailaMessage?: string;
}

export function createPatchesFromInteractResult(
  initialDocument: LooseLessonPlan,
  result: InteractResult,
) {
  // Generate patches from the document changes
  const patchesWithMetadata = [];

  // Use fast-json-patch to detect changes
  const patches = compare(initialDocument, result.document);

  // Create proper patch objects for each change
  for (const patch of patches) {
    // Convert path from /subject to subject
    const sectionKey = patch.path.substring(1); // Remove leading slash

    function getValueType(
      value: unknown,
    ): "string" | "string-array" | "object" {
      if (typeof value === "string") {
        return "string";
      }
      if (Array.isArray(value)) {
        return "string-array";
      }
      return "object";
    }

    if ("value" in patch) {
      patchesWithMetadata.push({
        type: "patch",
        reasoning: `Updated ${sectionKey} based on user request`,
        value: {
          type: getValueType(patch.value),
          op: patch.op,
          path: patch.path,
          value: patch.value,
        },
        status: "complete",
      });
    }
  }

  // Identify which sections were edited
  const sectionsEdited = [...new Set(patches.map((p) => p.path.substring(1)))];

  return {
    patches: patchesWithMetadata,
    sectionsEdited,
  };
}

export function createLlmMessageFromInteractResult(
  initialDocument: LooseLessonPlan,
  result: InteractResult,
) {
  const { patches, sectionsEdited } = createPatchesFromInteractResult(
    initialDocument,
    result,
  );

  // Create the llmMessage
  return {
    type: "llmMessage",
    sectionsToEdit: sectionsEdited,
    patches: patches,
    sectionsEdited: sectionsEdited,
    prompt: {
      type: "text",
      value:
        result.ailaMessage ??
        "Here's the updated lesson plan. Do you want to make any more changes?",
    },
    status: "complete",
  };
}

export function formatMessageWithRecordSeparators(message: any): string {
  return `\n␞\n${JSON.stringify(message)}\n␞\n`;
}

export async function streamInteractResultToClient(
  chat: AilaChat,
  controller: ReadableStreamDefaultController,
  initialDocument: LooseLessonPlan,
  result: InteractResult,
) {
  log.info("Streaming interact result to client");

  // Create and format the message
  const llmMessage = createLlmMessageFromInteractResult(
    initialDocument,
    result,
  );
  const formattedMessage = formatMessageWithRecordSeparators(llmMessage);

  // Send the message to the client
  controller.enqueue(formattedMessage);
  chat.appendChunk(formattedMessage);

  // Update the chat's document content
  chat.aila.document.content = result.document;

  // Send a state message to update the client's state
  await chat.enqueue({
    type: "state",
    reasoning: "final",
    value: result.document,
  } as JsonPatchDocumentOptional);

  log.info("Completed streaming interact result");
}

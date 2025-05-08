// packages/aila/src/lib/agents/streamHandling.ts
import { aiLogger } from "@oakai/logger";

import { compare } from "fast-json-patch";
import type { ReadableStreamDefaultController } from "stream/web";

import type { AilaChat } from "../../core/chat/AilaChat";
import type { JsonPatchDocumentOptional } from "../../protocol/jsonPatchProtocol";
import type { LooseLessonPlan } from "../../protocol/schema";
import type { InteractCallback } from "./interact";

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

export function createInteractStreamHandler(
  chat: AilaChat,
  controller: ReadableStreamDefaultController,
): InteractCallback {
  // Track sections and patches for the message
  const sectionsToEdit: string[] = [];
  const patches: any[] = [];

  return (update) => {
    log.info("Stream update received", update.type);

    switch (update.type) {
      case "progress":
        if (
          update.data.step === "routing" &&
          update.data.status === "completed"
        ) {
          // When routing is complete, we have the sections to edit
          if (update.data.plan?.type === "turn_plan") {
            // Extract section keys from the plan
            const newSections = update.data.plan.plan.map(
              (p: any) => p.sectionKey,
            );
            sectionsToEdit.push(...newSections);

            // Stream the opening part of the message with sectionsToEdit
            const openingPart = `{"type":"llmMessage","sectionsToEdit":${JSON.stringify(sectionsToEdit)},"patches":[`;
            streamChunks(controller, chat, openingPart);
          }
        }
        break;

      case "section_update":
        // When a section is updated, we have a new patch
        if (update.data.patches && update.data.patches.length > 0) {
          // Add comma if not the first patch
          if (patches.length > 0) {
            streamChunks(controller, chat, ",");
          }

          // Stream each patch
          for (let i = 0; i < update.data.patches.length; i++) {
            const patch = update.data.patches[i];
            const patchJson = JSON.stringify(patch);
            streamChunks(controller, chat, i > 0 ? "," + patchJson : patchJson);
            patches.push(patch);
          }
        }
        break;

      case "complete":
        // This will be handled by streamInteractResultToClient
        // We want to skip it to avoid duplicating the message
        return;
    }
  };
}

// Helper to stream chunks of text
function streamChunks(
  controller: ReadableStreamDefaultController,
  chat: AilaChat,
  text: string,
) {
  // Stream character by character or in small groups to mimic the recording format
  for (let i = 0; i < text.length; i++) {
    const chunkSize = Math.min(
      1 + Math.floor(Math.random() * 2),
      text.length - i,
    );
    const chunk = text.substring(i, i + chunkSize);
    controller.enqueue(chunk);
    chat.appendChunk(chunk);
    i += chunkSize - 1;
  }
}

// Modified to finish the streaming that was started by the handler
export async function streamInteractResultToClient(
  chat: AilaChat,
  controller: ReadableStreamDefaultController,
  initialDocument: LooseLessonPlan,
  result: InteractResult,
) {
  log.info("Streaming interact result to client");

  // Create the llmMessage (we need this for the complete structure)
  const llmMessage = createLlmMessageFromInteractResult(
    initialDocument,
    result,
  );

  // Stream the closing part of the message with sectionsEdited and prompt
  const closingPart = `],"sectionsEdited":${JSON.stringify(llmMessage.sectionsEdited)},"prompt":${JSON.stringify(llmMessage.prompt)},"status":"complete"}`;

  // Stream character by character to mimic the recording format
  for (let i = 0; i < closingPart.length; i++) {
    const chunkSize = Math.min(
      1 + Math.floor(Math.random() * 2),
      closingPart.length - i,
    );
    const chunk = closingPart.substring(i, i + chunkSize);
    controller.enqueue(chunk);
    chat.appendChunk(chunk);
    i += chunkSize - 1;
  }

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

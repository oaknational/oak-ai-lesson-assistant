import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";
import { applyPatch, deepClone, JsonPatchError } from "fast-json-patch";
import type { Operation } from "fast-json-patch";
import * as immer from "immer";
import untruncateJson from "untruncate-json";
import { z } from "zod";

import {
  type ExperimentalPatchDocument,
  type JsonPatchDocument,
  LLMMessageSchemaWhileStreaming,
  type MessagePart,
  type MessagePartDocument,
  MessagePartDocumentSchemaByType,
  type MessagePartType,
  type PatchDocument,
  PatchDocumentSchema,
  type TextDocument,
  TextDocumentSchema,
  type UnknownDocument,
} from "./jsonPatchSchema";
import { jsonPatchesToImmerPatches } from "./jsonPatchesToImmerPatches";
import type { LooseLessonPlan } from "./schema";
import { LessonPlanSchemaWhilstStreaming } from "./schema";

const log = aiLogger("aila:protocol");

function tryParseJson(str: string): {
  parsed: { type: string } | null;
  isPartial: boolean;
} {
  try {
    const parsed = JSON.parse(str);
    if (typeof parsed !== "object") {
      throw new Error("Parsed JSON is not an object");
    }
    if (!("type" in parsed)) {
      throw new Error("The JSON object does not have a type");
    }
    return { parsed, isPartial: false };
  } catch {
    try {
      // Is this a JSON streaming in?
      const parsedTruncated = JSON.parse(untruncateJson(str));
      if (isObject(parsedTruncated) && "type" in parsedTruncated) {
        return { parsed: parsedTruncated, isPartial: true };
      } else {
        throw new Error("The parsed JSON object does not have a type");
      }
    } catch {
      // If parsing fails, assume it's partial
      return { parsed: null, isPartial: true };
    }
  }
}

function isObject(value: unknown): value is { type: string } {
  return typeof value === "object" && value !== null && "type" in value;
}

export function tryParsePart(
  obj: Record<string, unknown>,
): MessagePartDocument | UnknownDocument {
  const { type } = obj;

  if (!MessagePartDocumentSchemaByType[type as MessagePartType]) {
    return {
      type: "unknown" as const,
      value: JSON.stringify(obj),
      error: "Invalid message part type",
    };
  }

  const parsed =
    MessagePartDocumentSchemaByType[type as MessagePartType].safeParse(obj);
  if (parsed.success) {
    return parsed.data as MessagePartDocument;
  }

  return {
    type: "unknown" as const,
    value: JSON.stringify(obj),
    error: parsed.error,
  };
}

export function tryParsePatch(obj: object): PatchDocument | UnknownDocument {
  const parsed = PatchDocumentSchema.safeParse(obj);
  if (parsed.success) {
    const patchDocument: PatchDocument = parsed.data;
    return patchDocument;
  } else {
    return { type: "unknown", value: JSON.stringify(obj), error: parsed.error };
  }
}

function tryParseText(obj: object): TextDocument | UnknownDocument {
  const parsed = TextDocumentSchema.safeParse(obj);
  if (parsed.success) {
    return parsed.data;
  } else {
    return { type: "unknown", value: JSON.stringify(obj), error: parsed.error };
  }
}

// Each Message that is sent back from the server contains the following
// (separated by the record-separator character and a newline):
// * An llmMessage matching the LLMMessageSchema, and containing multiple messageParts
// * An experimentalPatch messagePart
// * A moderation messagePart
// * An ID messagePart
// * A state messagePart
// (Potentially more)
// So we split the message into rows and parse each one.
// The message is streaming in, so we evaluate each row to see if it is
// valid JSON. If it is not, then we assume that the row is streaming
// and set an isPartial boolean on the resulting object.
// This helps us not to re-process past messageParts after they have
// fully streamed in.
export function parseMessageRow(row: string, index: number): MessagePart[] {
  // Handle legacy plain text content
  if (!row.startsWith("{")) {
    return [
      {
        type: "message-part",
        document: { type: "text", value: row.trim() },
        id: `${index}`,
        isPartial: false,
      },
    ];
  }

  const { parsed, isPartial } = tryParseJson(row);

  if (!parsed) {
    // If parsing fails, treat the entire row as a partial unknown message
    // and assume that once it streams in it will gain a type.
    return [
      {
        type: "message-part",
        document: { type: "unknown", value: row },
        id: `${index}`,
        isPartial: true,
      },
    ];
  }

  if (parsed.type === "llmMessage") {
    try {
      const llmMessage = LLMMessageSchemaWhileStreaming.parse(parsed);
      const result: MessagePart[] = [];
      let i = 0;
      for (const patch of llmMessage.patches ?? []) {
        const parsedPatch = tryParsePatch(patch);
        result.push({
          type: "message-part",
          document: parsedPatch,
          isPartial: parsedPatch.status !== "complete",
          id: `${index}-patch-${i}`,
        });
        i++;
      }

      if (llmMessage.prompt) {
        const parsedPrompt = tryParseText(llmMessage.prompt);
        result.push({
          type: "message-part",
          document: parsedPrompt,
          isPartial: llmMessage.status !== "complete",
          id: `${index}-prompt`,
        });
      }
      return result;
    } catch (e) {
      log.error("LLM Message parsing error", e);
      return [
        {
          type: "message-part",
          document: { type: "unknown", value: JSON.stringify(parsed) },
          isPartial,
          id: `${index}`,
        },
      ];
    }
  }
  const parsedPart = tryParsePart(parsed);

  // For non-llmResponse objects, return the entire row as a single message part
  return [
    { type: "message-part", document: parsedPart, isPartial, id: `${index}` },
  ];
}

// Handles parsing the message parts that are part of a message
// Each row is separated by the record separator character
// Rows can either be a valid document OR an object that looks like this:
// {"type":"llmMessage","patches":[{...},{...}]},"prompt":{"type":"text","message":"Some message"}}

export function parseMessageParts(content: string): MessagePart[] {
  const messageParts = content
    .split("␞")
    .map((r) => r.trim())
    .filter((r) => r.length > 5)
    .flatMap((row, index) => parseMessageRow(row, index))
    .filter((part) => part !== undefined)
    .flat();
  return messageParts;
}

export function extractPatches(edit: string): {
  validPatches: PatchDocument[];
  partialPatches: PatchDocument[];
} {
  const parts: MessagePart[] | undefined = parseMessageParts(edit);

  if (!parts) {
    // Handle parsing failure
    throw new Error("Failed to parse the edit content");
  }

  const patchMessageParts: MessagePart[] = parts.filter(
    (p) =>
      p.document.type === "patch" || p.document.type === "experimentalPatch",
  );
  const validPatches: PatchDocument[] = patchMessageParts
    .filter((p) => !p.isPartial)
    .map((p) => p.document as PatchDocument);
  const partialPatches: PatchDocument[] = patchMessageParts
    .filter((p) => p.isPartial)
    .map((p) => p.document as PatchDocument);

  log.info(
    "Extracted patches",
    validPatches.map((i) => i.value.path),
    partialPatches.map((i) => i.value.path),
  );
  return { validPatches, partialPatches };
}

// This isValidatePatch function only tells us if it contains an add / replace and a value
// and must date back to when we were allowing a very loose schema for patches
// #TODO we should probably rename this or add Zod validation or it could lead to bugs
function isValidPatch(patch: Operation): boolean {
  if (!patch?.path) return false;
  if (patch.op === "add" && !patch.value) {
    return false;
  }
  if (patch.op === "replace" && !patch.value) {
    return false;
  }
  return true;
}
export function applyLessonPlanPatch(
  lessonPlan: LooseLessonPlan,
  command: JsonPatchDocument | ExperimentalPatchDocument,
) {
  log.info("Apply patch", JSON.stringify(command));
  let updatedLessonPlan = { ...lessonPlan };
  if (command.type !== "patch" && command.type !== "experimentalPatch") {
    log.error("Invalid patch document type", command.type);
    return lessonPlan;
  }
  const patchValue = command.value;
  if (!isValidPatch(patchValue)) {
    log.error("Invalid patch");
    return;
  }

  try {
    const result = applyPatch(deepClone(updatedLessonPlan), [patchValue]);
    const newUpdatedLessonPlan = LessonPlanSchemaWhilstStreaming.parse(
      result.newDocument,
    );

    updatedLessonPlan = { ...newUpdatedLessonPlan };
  } catch (e) {
    const extra: Record<string, unknown> = {};
    if (e instanceof JsonPatchError) {
      extra["index"] = e.index;
      extra["operation"] = e.operation;
      extra["tree"] = e.tree;
      log.error("JSON Patch Error:", e, extra);
    } else if (e instanceof z.ZodError) {
      log.error(
        "Zod Error:",
        e.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", "),
      );
    } else {
      log.error("Failed to apply patch", patchValue, e);
    }
    Sentry.withScope(function (scope) {
      scope.setLevel("info");
      Sentry.captureException(e, { extra });
    });
  }
  return updatedLessonPlan;
}

/**
 * Applies a patch to a lesson plan, keeping stable object references for keys
 * that haven't changed
 */
export function applyLessonPlanPatchImmutable(
  lessonPlan: LooseLessonPlan,
  command: JsonPatchDocument | ExperimentalPatchDocument,
) {
  log.info("Apply patch", JSON.stringify(command));
  if (command.type !== "patch" && command.type !== "experimentalPatch") {
    log.error("Invalid patch document type", command.type);
    // return lessonPlan;
    return;
  }
  const patchValue = command.value;
  if (!isValidPatch(patchValue)) {
    log.error("Invalid patch");
    return;
  }

  try {
    // applyPatch mutates the document being passed in.
    // Immer applies the mutations to a draft copy of the document and returns
    // an altered copy of the original with stable references for unchanged values
    const newLessonPlan = immer.produce(lessonPlan, (draftLessonPlan) => {
      applyPatch(draftLessonPlan, [patchValue]);
    });

    // Zod returns a deep-cloned result which we can't use.
    // We can just rely on the fact that it didn't throw
    LessonPlanSchemaWhilstStreaming.parse(newLessonPlan);

    return newLessonPlan;
  } catch (e) {
    if (e instanceof z.ZodError) {
      log.error(
        "Zod Error:",
        e.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", "),
      );
    } else {
      log.error("Failed to apply patch", patchValue, e);
    }
    Sentry.captureException(e, { level: "info" });
    return;
  }
}

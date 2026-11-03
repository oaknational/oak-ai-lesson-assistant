import { moderationCategoriesSchema } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import type { Operation } from "fast-json-patch";
import { JsonPatchError, applyPatch, deepClone } from "fast-json-patch";
import * as immer from "immer";
import untruncateJson from "untruncate-json";
import { z } from "zod";

import type { PartialLessonPlan } from "./schema";
import {
  BasedOnOptionalSchema,
  BasedOnSchema,
  CycleOptionalSchema,
  CycleSchema,
  KeywordsOptionalSchema,
  KeywordsSchema,
  LatestQuizOptionalSchema,
  LatestQuizSchema,
  MisconceptionsOptionalSchema,
  MisconceptionsSchema,
  PartialLessonPlanSchema,
  QuizV1OptionalSchema,
  QuizV1Schema,
} from "./schema";

const log = aiLogger("aila:protocol");

export const PatchString = z.object({
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.union([
    z.literal("/title"),
    z.literal("/keyStage"),
    z.literal("/topic"),
    z.literal("/subject"),
    z.literal("/additionalMaterials"),
    z.literal("/learningOutcome"),
  ]),
  value: z.string(),
});

export const PatchStringArray = z.object({
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.union([
    z.literal("/priorKnowledge"),
    z.literal("/learningCycles"),
    z.literal("/keyLearningPoints"),
  ]),
  value: z.array(z.string()),
});

export const PatchCycleOptional = z.object({
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.union([
    z.literal("/cycle1"),
    z.literal("/cycle2"),
    z.literal("/cycle3"),
  ]),
  value: CycleOptionalSchema,
});

export const PatchCycle = z.object({
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.union([
    z.literal("/cycle1"),
    z.literal("/cycle2"),
    z.literal("/cycle3"),
  ]),
  value: CycleSchema,
});

/**
 * @deprecated Use PatchQuizV2Optional instead. V1 quiz format is deprecated in favor of V2.
 * This is only kept for backward compatibility with existing quiz generators.
 */
export const PatchQuizV1Optional = z.object({
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.union([z.literal("/starterQuiz"), z.literal("/exitQuiz")]),
  value: QuizV1OptionalSchema,
});

/**
 * @deprecated Use PatchQuizV2 instead. V1 quiz format is deprecated in favor of V2.
 * This is only kept for backward compatibility with existing quiz generators.
 */
export const PatchQuizV1 = z.object({
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.union([z.literal("/starterQuiz"), z.literal("/exitQuiz")]),
  value: QuizV1Schema,
});

// When using Structured Outputs we cannot specify the length of arrays or strings
// so we have to use a different schema and pass in the spec with a description and in the prompt

// V3 Quiz Patch Schemas
export const PatchQuizV3Optional = z.object({
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.union([z.literal("/starterQuiz"), z.literal("/exitQuiz")]),
  value: LatestQuizOptionalSchema,
});

export const PatchQuizV3 = z.object({
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.union([z.literal("/starterQuiz"), z.literal("/exitQuiz")]),
  value: LatestQuizSchema,
});

// Legacy V2 names for backward compatibility - these now use V3 schemas internally
export const PatchQuizV2Optional = PatchQuizV3Optional;
export const PatchQuizV2 = PatchQuizV3;

export const PatchBasedOnOptional = z.object({
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.literal("/basedOn"),
  value: BasedOnOptionalSchema,
});

export const PatchBasedOn = z.object({
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.literal("/basedOn"),
  value: BasedOnSchema,
});

export const PatchMisconceptionsOptional = z.object({
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.literal("/misconceptions"),
  value: MisconceptionsOptionalSchema,
});

export const PatchMisconceptions = z.object({
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.literal("/misconceptions"),
  value: MisconceptionsSchema,
});

export const PatchKeywordsOptional = z.object({
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.literal("/keywords"),
  value: KeywordsOptionalSchema,
});

export const PatchKeywords = z.object({
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.literal("/keywords"),
  value: KeywordsSchema,
});

export const JsonPatchRemoveSchema = z.object({
  op: z.literal("remove"),
  path: z.string(),
});

// Potentially remove this once stable
export const JsonPatchAddSchema = z.object({
  op: z.literal("add"),
  path: z.string(),
  value: z.union([z.string(), z.object({}), z.number(), z.array(z.string())]), // TODO - Allows any value type
});

// Potentially remove this once stable
export const JsonPatchReplaceSchema = z.object({
  op: z.literal("replace"),
  path: z.string(),
  value: z.union([z.string(), z.object({}), z.number(), z.array(z.string())]), // TODO - Allows any value type
});

export const JsonPatchValueSchema = z.union([
  //JsonPatchAddSchema, // Generic add for any path
  //JsonPatchReplaceSchema, // Generic replace for any path
  JsonPatchRemoveSchema, // Generic remove for any path
  PatchBasedOn,
  PatchString,
  PatchStringArray,
  PatchCycle,
  PatchQuizV1,
  PatchQuizV2,
  PatchMisconceptions,
  PatchKeywords,
]);

export const JsonPatchValueOptionalSchema = z.union([
  // These generate "add" and "replace" patches could potentially be
  // quite dangerous. Zod will validate anything you pass as a value
  // here, which means it will ignore the schema that is defined in the
  // subsequent schemas.
  // #TODO we should probably remove these and update the code that
  // relies on these loose types
  JsonPatchAddSchema, // Generic add for any path
  JsonPatchReplaceSchema, // Generic replace for any path
  JsonPatchRemoveSchema, // Generic remove for any path
  PatchBasedOnOptional,
  PatchString,
  PatchStringArray,
  PatchCycleOptional,
  PatchQuizV1Optional,
  PatchQuizV2Optional,
  PatchMisconceptionsOptional,
  PatchKeywordsOptional,
]);

export const PatchDocumentSchema = z.object({
  type: z.literal("patch"),
  reasoning: z.string().optional(),
  value: JsonPatchValueSchema,
  status: z.string().optional(),
});

export type PatchDocument = z.infer<typeof PatchDocumentSchema>;

export const ValidPatchDocumentSchema = PatchDocumentSchema;
export type ValidPatchDocument = z.infer<typeof ValidPatchDocumentSchema>;

export const PatchDocumentOptionalSchema = z.object({
  type: z.literal("patch"),
  reasoning: z.string(),
  value: JsonPatchValueOptionalSchema,
  status: z.literal("complete").optional(),
});

export type PatchDocumentOptional = z.infer<typeof PatchDocumentOptionalSchema>;

export const PromptDocumentSchema = z.object({
  type: z.literal("prompt"),
  message: z.string(),
  options: z.array(z.object({ id: z.string(), title: z.string() })).optional(),
  status: z.literal("complete").optional(),
});

export const PromptDocumentSchemaWithoutOptions = z.object({
  type: z.literal("prompt"),
  message: z.string(),
});

export type PromptDocument = z.infer<typeof PromptDocumentSchema>;

export const TextDocumentSchema = z.object({
  type: z.literal("text"),
  value: z.string(),
});

export type TextDocument = z.infer<typeof TextDocumentSchema>;

export const StateDocumentSchema = z.object({
  type: z.literal("state"),
  value: z.unknown(),
  reasoning: z.string().optional(),
});

export type StateDocument = z.infer<typeof StateDocumentSchema>;

export const CommentDocumentSchema = z.object({
  type: z.literal("comment"),
  value: z.unknown(),
});

export type CommentDocument = z.infer<typeof CommentDocumentSchema>;

export const ModerationDocumentSchema = z.object({
  type: z.literal("moderation"),
  id: z.string().optional(),
  categories: moderationCategoriesSchema,
});

export type ModerationDocument = z.infer<typeof ModerationDocumentSchema>;

export const ErrorDocumentSchema = z.object({
  type: z.literal("error"),
  value: z.string().optional().describe("Additional message for debugging"),
  message: z
    .string()
    .optional()
    .describe("User facing message, in Aila's voice"),
});

export type ErrorDocument = z.infer<typeof ErrorDocumentSchema>;

export const ActionDocumentSchema = z.object({
  type: z.literal("action"),
  action: z.enum(["SHOW_ACCOUNT_LOCKED"]).optional(),
});

export type ActionDocument = z.infer<typeof ActionDocumentSchema>;

export const BadDocumentSchema = z.object({
  type: z.literal("bad"),
  originalType: z.string().optional(),
  issues: z.unknown().optional(),
  value: z.unknown().optional(),
});

export type BadDocument = z.infer<typeof BadDocumentSchema>;

export const UnknownDocumentSchema = z.object({
  type: z.literal("unknown"),
  value: z.unknown().optional(),
  error: z.unknown().optional(),
  status: z.string().optional(),
});

export type UnknownDocument = z.infer<typeof UnknownDocumentSchema>;

export const MessageIdDocumentSchema = z.object({
  type: z.literal("id"),
  value: z.string(),
});

export type MessageIdDocument = z.infer<typeof MessageIdDocumentSchema>;

export const JsonPatchDocumentSchema = z.discriminatedUnion("type", [
  PatchDocumentSchema,
  PromptDocumentSchema,
  StateDocumentSchema,
  CommentDocumentSchema,
  ErrorDocumentSchema,
  ActionDocumentSchema,
  ModerationDocumentSchema,
  MessageIdDocumentSchema,
]);

// #TODO these optional schemas are perhaps not correct - they should be marked as optional
// because they stream in and are invalid as they first arrive
export const JsonPatchDocumentOptionalSchema = z.discriminatedUnion("type", [
  PatchDocumentOptionalSchema,
  PromptDocumentSchema,
  StateDocumentSchema,
  CommentDocumentSchema,
  ErrorDocumentSchema,
  ActionDocumentSchema,
  ModerationDocumentSchema,
  MessageIdDocumentSchema,
]);

export type JsonPatchDocumentOptional = z.infer<
  typeof JsonPatchDocumentOptionalSchema
>;

export type JsonPatchDocument = z.infer<typeof JsonPatchDocumentSchema>;

const MessagePartDocumentSchema = z.discriminatedUnion("type", [
  ModerationDocumentSchema,
  ErrorDocumentSchema,
  PatchDocumentSchema,
  StateDocumentSchema,
  CommentDocumentSchema,
  PromptDocumentSchema,
  TextDocumentSchema,
  ActionDocumentSchema,
  BadDocumentSchema,
  UnknownDocumentSchema,
  MessageIdDocumentSchema,
]);

export type MessagePartDocument = z.infer<typeof MessagePartDocumentSchema>;

export type MessagePartType =
  | "moderation"
  | "error"
  | "patch"
  | "state"
  | "comment"
  | "prompt"
  | "text"
  | "action"
  | "bad"
  | "unknown"
  | "id";

export const MessagePartDocumentSchemaByType: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in MessagePartType]: z.ZodSchema<any>;
} = {
  moderation: ModerationDocumentSchema,
  error: ErrorDocumentSchema,
  patch: PatchDocumentSchema,
  state: StateDocumentSchema,
  comment: CommentDocumentSchema,
  prompt: PromptDocumentSchema,
  text: TextDocumentSchema,
  action: ActionDocumentSchema,
  bad: BadDocumentSchema,
  unknown: UnknownDocumentSchema,
  id: MessageIdDocumentSchema,
};

export const MessagePartSchema = z.object({
  type: z.literal("message-part"),
  id: z.string(),
  isPartial: z.boolean(),
  document: MessagePartDocumentSchema,
});

export type MessagePart = z.infer<typeof MessagePartSchema>;

const LLMMessageSchemaWhileStreaming = z.object({
  type: z.literal("llmMessage"),
  sectionsToEdit: z.array(z.string()).optional(),
  patches: z.array(z.object({}).passthrough()).optional(),
  sectionsEdited: z.array(z.string()).optional(),
  prompt: TextDocumentSchema.optional(),
  status: z.literal("complete").optional(),
});

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
// * An llmMessage containing multiple messageParts
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

export function userMessageTextPart(content: string): MessagePart {
  return {
    type: "message-part",
    document: { type: "text", value: content.trim() },
    id: `${0}`,
    isPartial: false,
  };
}

const timeOperation = <T>(fn: () => T): T => {
  const startTime = performance.now();
  const result = fn();
  const endTime = performance.now();
  log.info(`extractPatches took ${endTime - startTime} milliseconds`);
  return result;
};

export function extractPatches(edit: string): {
  validPatches: PatchDocument[];
  partialPatches: PatchDocument[];
} {
  return timeOperation(() => {
    const parts: MessagePart[] | undefined = parseMessageParts(edit);

    if (!parts) {
      // Handle parsing failure
      throw new Error("Failed to parse the edit content");
    }

    const patchMessageParts: MessagePart[] = parts.filter(
      (p) => p.document.type === "patch",
    );
    const validPatches: PatchDocument[] = patchMessageParts
      .filter((p) => !p.isPartial)
      .map((p) => p.document as PatchDocument);
    const partialPatches: PatchDocument[] = patchMessageParts
      .filter((p) => p.isPartial)
      .map((p) => p.document as PatchDocument);

    // log.info(
    //   "Extracted patches",
    //   validPatches.map((i) => i.value.path),
    //   partialPatches.map((i) => i.value.path),
    // );
    return { validPatches, partialPatches };
  });
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
  lessonPlan: PartialLessonPlan,
  command: JsonPatchDocument,
) {
  log.info("Apply patch (old)", JSON.stringify(command));
  let updatedLessonPlan = { ...lessonPlan };
  if (command.type !== "patch") {
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
    const newUpdatedLessonPlan = PartialLessonPlanSchema.parse(
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
        e.issues
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
  lessonPlan: PartialLessonPlan,
  command: JsonPatchDocument,
) {
  log.info("Apply patch (immutable)", JSON.stringify(command));
  if (command.type !== "patch") {
    log.error("Invalid patch document type", command.type);
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
    PartialLessonPlanSchema.parse(newLessonPlan);

    return newLessonPlan;
  } catch (e) {
    if (e instanceof z.ZodError) {
      log.error(
        "Zod Error:",
        e.issues
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

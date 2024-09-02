import { moderationCategoriesSchema } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import * as Sentry from "@sentry/nextjs";
import {
  Operation,
  applyPatch,
  deepClone,
  JsonPatchError,
} from "fast-json-patch";
import untruncateJson from "untruncate-json";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

import {
  BasedOnOptionalSchema,
  BasedOnSchema,
  CycleOptionalSchema,
  CycleSchema,
  KeywordsOptionalSchema,
  KeywordsSchema,
  LessonPlanSchemaWhilstStreaming,
  LooseLessonPlan,
  MisconceptionsOptionalSchema,
  MisconceptionsSchema,
  QuizOptionalSchema,
  QuizSchema,
} from "./schema";

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

export const PatchQuizOptional = z.object({
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.union([z.literal("/starterQuiz"), z.literal("/exitQuiz")]),
  value: QuizOptionalSchema,
});

export const PatchQuiz = z.object({
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.union([z.literal("/starterQuiz"), z.literal("/exitQuiz")]),
  value: QuizSchema,
});

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
  value: z.unknown(), // TODO - Allows any value type
});

// Potentially remove this once stable
export const JsonPatchReplaceSchema = z.object({
  op: z.literal("replace"),
  path: z.string(),
  value: z.unknown(), // TODO - Allows any value type
});

export const JsonPatchValueSchema = z.union([
  JsonPatchAddSchema, // Generic add for any path
  JsonPatchReplaceSchema, // Generic replace for any path
  JsonPatchRemoveSchema, // Generic remove for any path
  PatchBasedOn,
  PatchString,
  PatchStringArray,
  PatchCycle,
  PatchQuiz,
  PatchMisconceptions,
  PatchKeywords,
]);

export const JsonPatchValueOptionalSchema = z.union([
  JsonPatchAddSchema, // Generic add for any path
  JsonPatchReplaceSchema, // Generic replace for any path
  JsonPatchRemoveSchema, // Generic remove for any path
  PatchBasedOnOptional,
  PatchString,
  PatchStringArray,
  PatchCycleOptional,
  PatchQuizOptional,
  PatchMisconceptionsOptional,
  PatchKeywordsOptional,
]);

export const PatchDocumentSchema = z.object({
  type: z.literal("patch"),
  reasoning: z.string().optional(),
  value: JsonPatchValueSchema,
});

export type PatchDocument = z.infer<typeof PatchDocumentSchema>;

const PatchDocumentOptionalSchema = z.object({
  type: z.literal("patch"),
  reasoning: z.string(),
  value: JsonPatchValueOptionalSchema,
});

export type PatchDocumentOptional = z.infer<typeof PatchDocumentOptionalSchema>;

export const PromptDocumentSchema = z.object({
  type: z.literal("prompt"),
  message: z.string(),
  options: z.array(z.object({ id: z.string(), title: z.string() })).optional(),
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

export const MessageIdDocumentSchema = z.object({
  type: z.literal("id"),
  value: z.string(),
});

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

export const JsonPatchDocumentJsonSchema = zodToJsonSchema(
  JsonPatchDocumentSchema,
  "patchDocumentSchema",
);

const LLMResponseSchema = z.discriminatedUnion("type", [
  PromptDocumentSchema,
  StateDocumentSchema,
  CommentDocumentSchema,
  ErrorDocumentSchema,
]);
export const LLMResponseJsonSchema = zodToJsonSchema(
  LLMResponseSchema,
  "llmResponseSchema",
);

export function extractMessageParts(message: string): string[] {
  // Note that sometimes the LLM does not respond with the record separator
  return message
    .replaceAll("\n\n{", "\n␞\n{")
    .split("␞")
    .map((r) => r.trim())
    .filter((r) => r?.length > 0);
}

interface PotentialMessage {
  type?: string;
  content?: string;
}
interface PartialMessage {
  type?: string;
  path?: string;
  isPartial: boolean;
  value?:
    | {
        path?: string;
        op?: string;
        value?: unknown;
      }
    | string;
}
export function parseMessagePart(part: string): PartialMessage | undefined {
  const trimmed = part.trim();
  if (!trimmed.startsWith("{")) {
    return { type: "text", value: trimmed, isPartial: false };
  }
  const isPartial = !trimmed.endsWith("}");
  const untruncated = untruncateJson(trimmed);
  const parsed: PotentialMessage = parseJsonSafely(untruncated);
  if (typeof parsed !== "object") {
    return undefined;
  }
  const parsedObject: PartialMessage = { isPartial, ...parsed };
  if (!parsedObject.type) {
    return undefined;
  }
  return parsedObject;
}

export function extractState(edit: string): StateDocument | null {
  const parsedDocuments: ({ type?: string; path?: string } | undefined)[] =
    extractMessageParts(edit).map((part) => parseMessagePart(part));
  const stateDocuments = parsedDocuments
    .filter((parsed) => parsed?.type === "state")
    .map((parsed) => StateDocumentSchema.parse(parsed));
  return stateDocuments[0] ?? null;
}

export function extractPatches(
  edit: string,
  mostRecent: number = 2,
): {
  validDocuments: PatchDocument[];
  partialDocuments: PatchDocument[];
} {
  const validDocuments: PatchDocument[] = [];
  const partialDocuments: PatchDocument[] = [];
  const parts = extractMessageParts(edit);
  const parsedDocuments: (PartialMessage | undefined)[] = parts
    .filter((_, i) => i >= parts.length - mostRecent)
    .map((part) => parseMessagePart(part))
    .filter((r) => r && r !== undefined)
    .filter((r) => r?.type === "patch");

  for (const parsed of parsedDocuments) {
    try {
      if (parsed?.type === "patch") {
        if (parsed.isPartial) {
          // This row is still streaming in
          try {
            partialDocuments.push(PatchDocumentSchema.parse(parsed));
          } catch (e) {
            // The patch isn't valid yet
          }
        } else {
          // This row is complete
          validDocuments.push(PatchDocumentSchema.parse(parsed));
        }
      }
    } catch (e) {
      console.error("Failed to parse patch", e);
      Sentry.captureException(e);
    }
  }

  return { validDocuments, partialDocuments };
}

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
  command: JsonPatchDocument,
) {
  let updatedLessonPlan = { ...lessonPlan };
  if (command.type !== "patch") return lessonPlan;
  const patch = command.value as Operation;
  if (!isValidPatch(patch)) {
    return;
  }

  try {
    const newUpdatedLessonPlan = LessonPlanSchemaWhilstStreaming.parse(
      applyPatch(deepClone(updatedLessonPlan), [patch]).newDocument,
    );
    updatedLessonPlan = { ...newUpdatedLessonPlan };
  } catch (e) {
    const extra: Record<string, unknown> = {};
    if (e instanceof JsonPatchError) {
      extra["index"] = e.index;
      extra["operation"] = e.operation;
      extra["tree"] = e.tree;
    }
    console.error("Failed to apply patch", e);
    Sentry.withScope(function (scope) {
      scope.setLevel("info");
      Sentry.captureException(e, { extra });
    });
  }

  // #TODO This is slightly ridiculous! Remove this once we are live
  if (updatedLessonPlan.misconceptions) {
    const working = updatedLessonPlan.misconceptions;
    for (const misconception of working) {
      misconception.description =
        misconception.description ?? misconception.definition;
    }
    updatedLessonPlan.misconceptions = working;
  }
  if (updatedLessonPlan.keywords) {
    const working = updatedLessonPlan.keywords;
    for (const keyword of working) {
      keyword.definition = keyword.definition ?? keyword.description;
    }
    updatedLessonPlan.keywords = working;
  }
  return updatedLessonPlan;
}

export function parseJsonSafely(jsonStr: string, logging: boolean = false) {
  function log(...args: unknown[]) {
    if (logging) {
      console.log("JSON", ...args);
    }
  }
  if (!jsonStr.trim().startsWith("{") || !jsonStr.includes('":')) {
    log("Not JSON", jsonStr);
    return null; // Early return if it doesn't look like JSON
  }
  while (jsonStr.length > 0) {
    try {
      log("Parse", { jsonStr });
      // Attempt to parse the JSON
      return JSON.parse(jsonStr);
    } catch (error) {
      if (error instanceof SyntaxError) {
        log("Syntax error, try with reduced length", error);
        // If there's a syntax error, remove the last character and try again
        jsonStr = jsonStr.substring(0, jsonStr.length - 1);
      } else {
        // If the error is not a syntax error, rethrow it
        throw error;
      }
    }
  }

  // Return null if no valid JSON could be extracted
  return null;
}

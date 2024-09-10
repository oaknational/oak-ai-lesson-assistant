import { moderationCategoriesSchema } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import * as Sentry from "@sentry/nextjs";
import {
  Operation,
  applyPatch,
  deepClone,
  JsonPatchError,
} from "fast-json-patch";
import { ZodError, ZodSchema, z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

import {
  BasedOnOptionalSchema,
  BasedOnSchema,
  CycleOptionalSchema,
  CycleSchema,
  CycleSchemaWithoutLength,
  KeywordsOptionalSchema,
  KeywordsSchema,
  KeywordsSchemaWithNoLength,
  LessonPlanSchemaWhilstStreaming,
  LooseLessonPlan,
  MisconceptionsOptionalSchema,
  MisconceptionsSchema,
  MisconceptionsSchemaWithoutLength,
  QuizOptionalSchema,
  QuizSchema,
  QuizSchemaWithoutLength,
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

export const PatchStringForLLM = z.object({
  type: z.literal("string"),
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

export const PatchStringArrayForLLM = z.object({
  type: z.literal("string-array"),
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

export const PatchCycleForLLM = z.object({
  type: z.literal("cycle"),
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.union([
    z.literal("/cycle1"),
    z.literal("/cycle2"),
    z.literal("/cycle3"),
  ]),
  value: CycleSchemaWithoutLength.describe(
    "This is the definition of the learning cycle that you are proposing. You MUST include this definition for the patch to be valid. It should never be just an empty object {}.",
  ),
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

export const PatchQuizForLLM = z.object({
  type: z.literal("quiz"),
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.union([z.literal("/starterQuiz"), z.literal("/exitQuiz")]),
  value: QuizSchemaWithoutLength,
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

export const PatchBasedOnForLLM = z.object({
  type: z.literal("basedOn"),
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

export const PatchMisconceptionsForLLM = z.object({
  type: z.literal("misconceptions"),
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.literal("/misconceptions"),
  value: MisconceptionsSchemaWithoutLength,
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

export const PatchKeywordsForLLM = z.object({
  type: z.literal("keywords"),
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.literal("/keywords"),
  value: KeywordsSchemaWithNoLength,
});

export const JsonPatchRemoveSchema = z.object({
  op: z.literal("remove"),
  path: z.string(),
});

export const JsonPatchRemoveSchemaForLLM = z.object({
  type: z.literal("remove"),
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
  PatchQuiz,
  PatchMisconceptions,
  PatchKeywords,
]);

export const JsonPatchValueForLLMSchema = z.union([
  //JsonPatchAddSchema, // Generic add for any path
  //JsonPatchReplaceSchema, // Generic replace for any path
  JsonPatchRemoveSchemaForLLM, // Generic remove for any path
  PatchBasedOnForLLM,
  PatchStringForLLM,
  PatchStringArrayForLLM,
  PatchCycleForLLM,
  PatchQuizForLLM,
  PatchMisconceptionsForLLM,
  PatchKeywordsForLLM,
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

// This is the schema that we send when requesting Structured Outputs
// From the LLM. We are limited to not having min, max and we also
// have constraints about ensuring each object has a type attribute
// as its first attribute in the definition.
// Note, that unless/until we migrate all past messages we won't be
// able to use this to validate the patches currently in the database
// because they would be missing a "type" attribute.
export const LLMPatchDocumentSchema = z.object({
  type: z.literal("patch"),
  reasoning: z.string(),
  value: z.discriminatedUnion("type", [
    PatchStringArrayForLLM,
    PatchStringForLLM,
    PatchBasedOnForLLM,
    PatchMisconceptionsForLLM,
    PatchQuizForLLM,
    PatchKeywordsForLLM,
    PatchCycleForLLM,
    JsonPatchRemoveSchemaForLLM,
  ]),
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

export const JsonPatchDocumentJsonSchema = zodToJsonSchema(
  JsonPatchDocumentSchema,
  "patchDocumentSchema",
);

export const LLMResponseSchema = z.discriminatedUnion("type", [
  PatchDocumentSchema,
  PromptDocumentSchema,
  StateDocumentSchema,
  CommentDocumentSchema,
  ErrorDocumentSchema,
]);

export const LLMResponseJsonSchema = zodToJsonSchema(
  LLMResponseSchema,
  "llmResponseSchema",
);

export const MessagePartDocumentSchema = z.discriminatedUnion("type", [
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

const MessagePartSchema = z.object({
  type: z.literal("message-part"),
  id: z.string(),
  isPartial: z.boolean(),
  document: MessagePartDocumentSchema,
});

export type MessagePart = z.infer<typeof MessagePartSchema>;

export const LLMMessageSchema = z.object({
  type: z.literal("llmMessage"),
  patches: z.array(PatchDocumentSchema),
  prompt: TextDocumentSchema,
});

const LLMMessageSchemaWhileStreaming = z.object({
  type: z.literal("llmMessage"),
  patches: z.array(z.object({}).passthrough()).optional(),
  prompt: TextDocumentSchema.optional(),
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
  } catch (e) {
    // If parsing fails, assume it's partial
    return { parsed: null, isPartial: true };
  }
}

export function tryParsePart(
  obj: object,
): MessagePartDocument | UnknownDocument {
  const { type } = obj as { type: string };
  // Assert the message part type is allowed
  if (!MessagePartDocumentSchemaByType[type as MessagePartType]) {
    console.error("Invalid message part type", type);
    return {
      type: "unknown",
      value: JSON.stringify,
      error: "Invalid message part type",
    };
  }
  // Parse the object with the correct schema
  const parsed =
    MessagePartDocumentSchemaByType[type as MessagePartType].safeParse(obj);
  if (parsed.success) {
    return parsed.data;
  } else {
    return { type: "unknown", value: JSON.stringify(obj), error: parsed.error };
  }
}

export function tryParsePatch(obj: object): PatchDocument | UnknownDocument {
  const parsed = PatchDocumentSchema.safeParse(obj);
  if (parsed.success) {
    const patchDocument: PatchDocument = parsed.data;
    return patchDocument;
  } else {
    console.log("Unable to parse patch", parsed, parsed.error);
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
          isPartial,
          id: `${index}-patch-${i}`,
        });
        i++;
      }

      if (llmMessage.prompt) {
        const parsedPrompt = tryParseText(llmMessage.prompt);
        result.push({
          type: "message-part",
          document: parsedPrompt,
          isPartial,
          id: `${index}-prompt`,
        });
      }
      return result;
    } catch (e) {
      console.error("LLM Message parsing error", e);
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

export function extractPatches(
  edit: string,
  mostRecent: number = 2,
): {
  validPatches: PatchDocument[];
  partialPatches: PatchDocument[];
} {
  const validPatches: PatchDocument[] = [];
  const partialPatches: PatchDocument[] = [];

  const messageParts = parseMessageParts(edit);
  const relevantParts = messageParts.slice(-mostRecent);

  for (const part of relevantParts) {
    if (part.document.type === "patch") {
      try {
        const validatedPatch = PatchDocumentSchema.parse(part.document);
        if (part.isPartial) {
          partialPatches.push(validatedPatch);
        } else {
          validPatches.push(validatedPatch);
        }
      } catch (e) {
        if (e instanceof ZodError) {
          console.log(
            "Failed to parse patch due to Zod validation errors:",
            part,
          );
          e.errors.forEach((error, index) => {
            console.log(`Error ${index + 1}:`);
            console.log(`  Path: ${error.path.join(".")}`);
            console.log(`  Message: ${error.message}`);
            if (error.code) console.log(`  Code: ${error.code}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorValue = error.path.reduce((obj: any, key) => {
              if (obj && typeof obj === "object" && key in obj) {
                return (obj as Record<string, unknown>)[key];
              }
              return undefined;
            }, part);
            console.error(`  Invalid value:`, errorValue);
          });
        } else {
          console.error("Failed to parse patch:", e);
        }

        Sentry.withScope(function (scope) {
          scope.setLevel("error");
          if (e instanceof ZodError) {
            scope.setExtra("zodErrors", e.errors);
          }
          scope.setExtra("parsedData", part);
          Sentry.captureException(e);
        });
      }
    }
  }

  return { validPatches, partialPatches };
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
    console.error("Invalid patch");
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
    console.error("Failed to apply patch", patch, e);
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

// Handles parsing the message parts that are part of a message
// Each row is separated by the record separator character
// Rows can either be a valid document OR an object that looks like this:
// {"type":"llmMessage","patches":[{...},{...}]},"prompt":{"type":"text","message":"Some message"}}

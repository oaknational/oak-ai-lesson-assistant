import { moderationCategoriesSchema } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";
import type { Operation } from "fast-json-patch";
import { applyPatch, deepClone, JsonPatchError } from "fast-json-patch";
import untruncateJson from "untruncate-json";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

import type { LooseLessonPlan } from "./schema";
import {
  BasedOnOptionalSchema,
  BasedOnSchema,
  CycleOptionalSchema,
  CycleSchema,
  CycleSchemaWithoutLength,
  KeywordsOptionalSchema,
  KeywordsSchema,
  KeywordsSchemaWithoutLength,
  LessonPlanSchemaWhilstStreaming,
  MisconceptionsOptionalSchema,
  MisconceptionsSchema,
  MisconceptionsSchemaWithoutLength,
  QuizOptionalSchema,
  QuizSchema,
  QuizSchemaWithoutLength,
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

// When using Structured Outputs we must include a "type" attribute as the first
// attribute in the object, otherwise it results in an error when generating the
// JSON Schema
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

// When using Structured Outputs we must include a "type" attribute as the first
// attribute in the object, otherwise it results in an error when generating the
// JSON Schema
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

// When using Structured Outputs we cannot specify the length of arrays or strings
// so we have to use a different schema and pass in the spec with a description and in the prompt
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

// When using Structured Outputs we cannot specify the length of arrays or strings
// so we have to use a different schema and pass in the spec with a description and in the prompt
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

// When using Structured Outputs we cannot specify the length of arrays or strings
// so we have to use a different schema and pass in the spec with a description and in the prompt
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

// When using Structured Outputs we cannot specify the length of arrays or strings
// so we have to use a different schema and pass in the spec with a description and in the prompt
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

// When using Structured Outputs we cannot specify the length of arrays or strings
// so we have to use a different schema and pass in the spec with a description and in the prompt
export const PatchKeywordsForLLM = z.object({
  type: z.literal("keywords"),
  op: z.union([z.literal("add"), z.literal("replace")]),
  path: z.literal("/keywords"),
  value: KeywordsSchemaWithoutLength,
});

export const JsonPatchRemoveSchema = z.object({
  op: z.literal("remove"),
  path: z.string(),
});

// When using Structured Outputs we cannot specify the length of arrays or strings
// so we have to use a different schema and pass in the spec with a description and in the prompt
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

// Because we cannot use min/max lengths for arrays and strings we have a separate schema
// when we are using Structured Outputs
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
  PatchQuizOptional,
  PatchMisconceptionsOptional,
  PatchKeywordsOptional,
]);

export const PatchDocumentSchema = z.object({
  type: z.literal("patch"),
  reasoning: z.string().optional(),
  value: JsonPatchValueSchema,
  status: z.string().optional(),
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
  status: z.literal("complete"),
});

export type PatchDocument = z.infer<typeof PatchDocumentSchema>;

const ExperimentalPatchMessagePartSchema = z.union([
  z.object({
    op: z.union([z.literal("add"), z.literal("replace")]),
    path: z.union([
      z.literal("/_experimental_starterQuizMathsV0"),
      z.literal("/_experimental_exitQuizMathsV0"),
    ]),
    value: z.array(z.object({}).passthrough()),
  }),
  z.object({
    op: z.literal("remove"),
    path: z.union([
      z.literal("/_experimental_starterQuizMathsV0"),
      z.literal("/_experimental_exitQuizMathsV0"),
    ]),
  }),
]);
// This is the schema for experimental patches, which are part of our prototype agent system
const ExperimentalPatchDocumentSchema = z.object({
  type: z.literal("experimentalPatch"),
  value: ExperimentalPatchMessagePartSchema,
});
export type ExperimentalPatchDocument = z.infer<
  typeof ExperimentalPatchDocumentSchema
>;

export const ValidPatchDocumentSchema = z.union([
  PatchDocumentSchema,
  ExperimentalPatchDocumentSchema,
]);
export type ValidPatchDocument = z.infer<typeof ValidPatchDocumentSchema>;

const PatchDocumentOptionalSchema = z.object({
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
  ExperimentalPatchDocumentSchema,
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
  ExperimentalPatchDocumentSchema,
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
  | "experimentalPatch"
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
  experimentalPatch: ExperimentalPatchDocumentSchema,
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
  sectionsToEdit: z
    .array(z.string())
    .describe(
      "The sections of the lesson plan that you are considering editing. This should be an array of strings, where each string is the key of the section you are proposing to edit. For example, if you are proposing to edit the 'priorKnowledge' section, you should include 'priorKnowledge' in this array. If you are proposing to edit multiple sections, you should include all of the keys in this array.",
    ),
  patches: z
    .array(LLMPatchDocumentSchema)
    .describe(
      "This is the set of patches you have generated to edit the lesson plan. Follow the instructions in the system prompt to ensure that you produce a valid patch. For instance, if you are providing a patch to add a cycle, the op should be 'add' and the value should be the JSON object representing the full, valid cycle. The same applies for all of the other parts of the lesson plan. This should not include more than one 'add' patch for the same section of the lesson plan. These edits will overwrite each other and result in unexpected results. If you want to do multiple updates on the same section, it is best to generate one 'add' patch with all of your edits included.",
    ),
  sectionsEdited: z
    .array(z.string())
    .describe(
      "The sections of the lesson plan that you are actually edited. This should be an array of strings, where each string is the key of the section you are proposing to edit. For example, if you edited the 'priorKnowledge' section, you should include 'priorKnowledge' in this array. If you edited multiple sections, you should include all of the keys in this array.",
    ),
  prompt: TextDocumentSchema.describe(
    "If you imagine the user talking to you, this is where you would put your human-readable reply that would explain the changes you have made (if any), ask them questions, and prompt them to send their next message. This should not contain any of the lesson plan content. That should all be delivered in patches. If you have made edits, you should respond to the user by asking if they are happy with the changes you have made if any, and prompt them with what they can do next",
  ),
  status: z.literal("complete"),
});

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
  } catch (e) {
    try {
      // Is this a JSON streaming in?
      const parsedTruncated = JSON.parse(untruncateJson(str));
      if (isObject(parsedTruncated) && "type" in parsedTruncated) {
        return { parsed: parsedTruncated, isPartial: true };
      } else {
        throw new Error("The parsed JSON object does not have a type");
      }
    } catch (e) {
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

  // Assert the message part type is allowed
  if (!MessagePartDocumentSchemaByType[type as MessagePartType]) {
    log.error("Invalid message part type", type);
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

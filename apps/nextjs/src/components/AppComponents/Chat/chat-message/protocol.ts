import {
  ActionDocument,
  ActionDocumentSchema,
  BadDocument,
  BadDocumentSchema,
  CommentDocument,
  CommentDocumentSchema,
  ErrorDocument,
  ErrorDocumentSchema,
  MessageIdDocumentSchema,
  ModerationDocument,
  ModerationDocumentSchema,
  PatchDocument,
  PatchDocumentSchema,
  PromptDocument,
  PromptDocumentSchema,
  StateDocument,
  StateDocumentSchema,
  TextDocument,
  TextDocumentSchema,
  extractMessageParts,
  parseMessagePart,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";
import z, { ZodError } from "zod";

export type MessagePart =
  | (ModerationDocument & { isPartial?: boolean })
  | (ErrorDocument & { isPartial?: boolean })
  | (PatchDocument & { isPartial?: boolean })
  | (StateDocument & { isPartial?: boolean })
  | (CommentDocument & { isPartial?: boolean })
  | (PromptDocument & { isPartial?: boolean })
  | (TextDocument & { isPartial?: boolean })
  | (ActionDocument & { isPartial?: boolean })
  | (BadDocument & { isPartial?: boolean });

export function isPatch(part: MessagePart): part is PatchDocument {
  return part.type === "patch";
}
export function isModeration(part: MessagePart): part is ModerationDocument {
  return part.type === "moderation";
}
export function isAccountLocked(part: MessagePart): part is ActionDocument {
  return part.type === "action" && part.action === "SHOW_ACCOUNT_LOCKED";
}
export function parseMessageParts(content: string): MessagePart[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schemaMap: { [key: string]: z.ZodSchema<any> } = {
    moderation: ModerationDocumentSchema,
    error: ErrorDocumentSchema,
    patch: PatchDocumentSchema,
    prompt: PromptDocumentSchema,
    state: StateDocumentSchema,
    comment: CommentDocumentSchema,
    action: ActionDocumentSchema,
    text: TextDocumentSchema,
    bad: BadDocumentSchema,
    id: MessageIdDocumentSchema,
  };

  const extracted = extractMessageParts(content);
  const parts = extracted
    .filter((line) => line.length > 15) // Strips out streaming / empty lines from the protocol
    .map((part) => parseMessagePart(part))
    .map((part) => {
      if (!part) {
        return null;
      }
      if (!part.type) {
        return null;
      }

      const schema = schemaMap[part.type] || BadDocumentSchema;
      let parsedDoc: MessagePart | null = null;

      try {
        parsedDoc = schema.parse(part);
      } catch (e) {
        const isPartial = part.isPartial ?? false;
        if (!isPartial) {
          const errorDoc: BadDocument & { isPartial?: boolean } = {
            type: "bad",
            originalType: part.type,
            value: part,
            isPartial: isPartial,
            issues: e instanceof ZodError ? e.issues : undefined,
          };
          if (e instanceof ZodError) {
            console.error("Error parsing", part, e.format());
          }

          parsedDoc = errorDoc;
        }
      }

      return parsedDoc;
    })
    .filter((part): part is MessagePart => part !== null);
  console.log("Extracted parts", parts);
  return parts;
}

import { type Moderation } from "@prisma/client";

import type { JsonPatchDocumentOptional } from "../../protocol/jsonPatchProtocol";
import { type AilaServices } from "../AilaServices";

export type AilaPluginContext = {
  aila: AilaServices;
  enqueue: (message: JsonPatchDocumentOptional) => Promise<void>;
};
export type AilaPlugin = {
  onStreamError(error: unknown, context: AilaPluginContext): Promise<void>;
  onToxicModeration(
    moderation: Moderation,
    context: AilaPluginContext,
  ): Promise<void>;
  onBackgroundWork(promise: Promise<unknown>): void;
};

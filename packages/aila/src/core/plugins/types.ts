import { Moderation } from "@prisma/client";

import { JsonPatchDocumentOptional } from "../../protocol/jsonPatchProtocol";
import { AilaServices } from "../AilaServices";

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

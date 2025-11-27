import type { JsonPatchDocumentOptional } from "../../../protocol/jsonPatchProtocol";
import type { AilaTurnCallbacks } from "../types";
import { createTextStreamer } from "./helpers/createTextStreamer";
import { createOnPlannerComplete } from "./onPlannerComplete";
import { createOnSectionComplete } from "./onSectionComplete";
import { createOnTurnComplete } from "./onTurnComplete";

export function createAilaTurnCallbacks({
  chat,
  controller,
}: {
  chat: {
    appendChunk: (chunk: string) => void;
    enqueue: <T extends JsonPatchDocumentOptional>(event: T) => Promise<void>;
  };
  controller: ReadableStreamDefaultController;
}): AilaTurnCallbacks {
  const patchState = { isFirstSection: true };
  const textStreamer = createTextStreamer(controller, chat);
  const onPlannerComplete = createOnPlannerComplete(textStreamer);
  const onSectionComplete = createOnSectionComplete(textStreamer, patchState);
  const onTurnComplete = createOnTurnComplete(textStreamer);

  return {
    onPlannerComplete,
    onSectionComplete,
    onTurnComplete: async (args) => {
      onTurnComplete(args);
      // Handle turn completion
      await chat.enqueue({
        type: "state",
        reasoning: "final",
        value: args.nextDoc,
      });
    },
  };
}

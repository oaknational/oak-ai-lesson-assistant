import { aiLogger } from "@oakai/logger";

import type { ChatSetter, ChatGetter, AilaStreamingStatus } from "../types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = aiLogger("chat:store");

export const handleAilaStreamingStatusUpdated =
  (set: ChatSetter, get: ChatGetter) =>
  (streamingStatus: AilaStreamingStatus) => {
    if (streamingStatus === "Idle" && get().queuedUserAction) {
      void get().actions.executeQueuedAction();
    }
  };

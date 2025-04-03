import { aiLogger } from "@oakai/logger";

import type { AilaStreamingStatus } from "@/stores/chatStore/types";

import type { ModerationGetter, ModerationSetter } from "../types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = aiLogger("chat:store");

export const handleAilaStreamingStatusUpdated =
  (set: ModerationSetter, get: ModerationGetter) =>
  (streamingStatus: AilaStreamingStatus) => {
    if (streamingStatus === "Idle") {
      void get().actions.fetchModerations();
    }
  };

import { aiLogger } from "@oakai/logger";
import invariant from "tiny-invariant";

import type { ChatStore } from "../index";
import { canAppendSelector } from "../selectors";

const log = aiLogger("chat:store");

export const handleAppend =
  (set: (partial: Partial<ChatStore>) => void, get: () => ChatStore) =>
  (message: string) => {
    const { ailaStreamingStatus, queuedUserAction, aiSdkActions } = get();
    const canAppend = canAppendSelector(get());
    if (!canAppend) {
      log.error("Cannot append message");
      return;
    }

    if (ailaStreamingStatus !== "Idle") {
      invariant(
        !queuedUserAction,
        "Cannot append when a message is already queued",
      );
      log.info("Queueing user action", message);
      set({ queuedUserAction: message });
      return;
    }

    log.info("Appending message to AI SDK", message);
    void aiSdkActions.append({
      content: message,
      role: "user",
    });
  };

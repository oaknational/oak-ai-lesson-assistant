import { aiLogger } from "@oakai/logger";

import invariant from "tiny-invariant";

import { canAppendSelector } from "../selectors";
import type { ChatGetter, ChatSetter } from "../types";

const log = aiLogger("chat:store");

export const handleAppend =
  (set: ChatSetter, get: ChatGetter) => (message: string) => {
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

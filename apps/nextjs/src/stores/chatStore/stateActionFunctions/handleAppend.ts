import { aiLogger } from "@oakai/logger";

import invariant from "tiny-invariant";

import { canAppendSelector } from "../selectors";
import type { ChatAction, ChatGetter, ChatSetter } from "../types";

const log = aiLogger("chat:store");

export const handleAppend =
  (set: ChatSetter, get: ChatGetter) => (action: ChatAction) => {
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
      log.info("Queueing user action", action.type);
      set({ queuedUserAction: action });
      return;
    }

    if (action.type === "message") {
      log.info("Appending message to AI SDK", action.content);
      void aiSdkActions.append({
        content: action.content,
        role: "user",
      });
    } else if (action.type === "continue") {
      log.info("Sending continue message to AI SDK");
      void aiSdkActions.append({
        content: "Continue",
        role: "user",
      });
    } else if (action.type === "regenerate") {
      log.info("Regenerating response");
      void aiSdkActions.reload();
    }
  };

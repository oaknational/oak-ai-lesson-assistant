import { aiLogger } from "@oakai/logger";

import type { ChatGetter, ChatSetter } from "../types";

const log = aiLogger("chat:store");

export function handleExecuteQueuedAction(set: ChatSetter, get: ChatGetter) {
  return () => {
    const { queuedUserAction, aiSdkActions } = get();

    if (!queuedUserAction) {
      log.warn("Ignored attempt to execute queued action", {
        queuedUserAction,
      });
      return;
    }

    log.info("Executing queued action");
    const actionToExecute = queuedUserAction;
    set({ queuedUserAction: null });

    try {
      if (actionToExecute === "continue") {
        void aiSdkActions.append({
          content: "Continue",
          role: "user",
        });
      } else if (actionToExecute === "regenerate") {
        void aiSdkActions.reload();
      } else {
        void aiSdkActions.append({
          content: actionToExecute,
          role: "user",
        });
      }
    } catch (error) {
      log.error("Error handling queued action:", error);
    }
  };
}

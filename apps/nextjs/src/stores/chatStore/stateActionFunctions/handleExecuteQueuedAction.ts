import { aiLogger } from "@oakai/logger";

import type { ChatAction, ChatGetter, ChatSetter } from "../types";

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

    log.info("Executing queued action", queuedUserAction.type);
    const actionToExecute = queuedUserAction;
    set({ queuedUserAction: null });

    try {
      if (actionToExecute.type === "message") {
        void aiSdkActions.append({
          content: actionToExecute.content,
          role: "user",
        });
      } else if (actionToExecute.type === "continue") {
        void aiSdkActions.append({
          content: "Continue",
          role: "user",
        });
      } else if (actionToExecute.type === "regenerate") {
        void aiSdkActions.reload();
      }
    } catch (error) {
      log.error("Error handling queued action:", error);
    }
  };
}

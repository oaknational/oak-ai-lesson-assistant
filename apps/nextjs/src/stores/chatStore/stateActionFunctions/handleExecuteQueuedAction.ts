import { aiLogger } from "@oakai/logger";

const log = aiLogger("chat:store");

export function handleExecuteQueuedAction(set, get) {
  return async () => {
    const { queuedUserAction, isExecutingQueuedAction, actions } = get();
    const { append, reload } = actions;

    if (!queuedUserAction || isExecutingQueuedAction) {
      log.warn("Ignored attempt to execute queued action", {
        queuedUserAction,
        isExecutingQueuedAction,
      });
      return;
    }

    log.info("Executing queued action");
    const actionToExecute = queuedUserAction;
    set({ isExecutingQueuedAction: true, queuedUserAction: null });

    try {
      if (actionToExecute === "continue") {
        await append({
          content: "Continue",
          role: "user",
        });
      } else if (actionToExecute === "regenerate") {
        reload();
      } else {
        await append({
          content: actionToExecute,
          role: "user",
        });
      }
    } catch (error) {
      log.error("Error handling queued action:", error);
    } finally {
      set({ isExecutingQueuedAction: false });
    }
  };
}

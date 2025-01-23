import { structuredLogger as logger } from "@oakai/logger";

export function handleExecuteQueuedAction(set, get) {
  return async () => {
    const { queuedUserAction, isExecutingQueuedAction, actions } = get();
    const { append, reload } = actions;

    if (!queuedUserAction || isExecutingQueuedAction) return;

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
      logger.error("Error handling queued action:", error);
    } finally {
      set({ isExecutingQueuedAction: false });
    }
  };
}

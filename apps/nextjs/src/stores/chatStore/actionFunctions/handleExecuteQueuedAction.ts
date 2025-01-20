export function handleExecuteQueuedAction(set, get) {
  return async () => {
    const { queuedUserAction, isExecutingAction } = get();

    if (!queuedUserAction || isExecutingAction) return;

    set({ isExecutingAction: true });
    const actionToExecute = queuedUserAction;
    set({ queuedUserAction: null });

    try {
      if (actionToExecute === "continue") {
        await get().append({
          content: "Continue",
          role: "user",
        });
      } else if (actionToExecute === "regenerate") {
        get().reload();
      } else {
        await get().append({
          content: actionToExecute,
          role: "user",
        });
      }
    } catch (error) {
      console.error("Error handling queued action:", error);
    } finally {
      set({ isExecutingAction: false });
    }
  };
}

export function handleExecuteQueuedAction(set, get) {
  return async () => {
    const { queuedUserAction, isExecutingAction, actions } = get();
    const { append, reload } = actions;

    if (!queuedUserAction || isExecutingAction) return;

    const actionToExecute = queuedUserAction;
    set({ isExecutingAction: true, queuedUserAction: null });

    console.log("*****", actionToExecute);

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
      console.error("Error handling queued action:", error);
    } finally {
      set({ isExecutingAction: false });
    }
  };
}

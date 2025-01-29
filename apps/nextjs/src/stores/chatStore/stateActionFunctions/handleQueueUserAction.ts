import type { ChatStore } from "..";

export const handleQueueUserAction =
  (set: (partial: Partial<ChatStore>) => void, get: () => ChatStore) =>
  (action: string) => {
    set({ queuedUserAction: action });
    // Typically a queued user action will be invoked later. It's not reliable to await
    // the queued user action so we return void to discourage that use
    void get().executeQueuedAction();
  };

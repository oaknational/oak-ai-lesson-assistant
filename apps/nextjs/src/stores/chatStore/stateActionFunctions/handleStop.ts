import type { ChatStore } from "../index";

export const handleStop =
  (set: (partial: Partial<ChatStore>) => void, get: () => ChatStore) => () => {
    if (get().queuedUserAction) {
      set({ queuedUserAction: null });
    } else {
      get().actions.stop();
    }
  };

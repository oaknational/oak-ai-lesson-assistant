import type { ChatStore } from "..";

export const handleQueueUserAction =
  (set: (partial: Partial<ChatStore>) => void, get: () => ChatStore) =>
  async (action: string) => {
    set({ queuedUserAction: action });
    await get().executeQueuedAction();
  };

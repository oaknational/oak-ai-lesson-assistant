import type { ChatStore } from "../index";

export const handleStreamingFinished =
  (set: (partial: Partial<ChatStore>) => void, get: () => ChatStore) => () => {
    get().scrollToBottom();

    // TODO: commented while we have the same in handleSetMessages
    // if (get().queuedUserAction) {
    //   void get().executeQueuedAction();
    // }
  };

import type { ChatStore } from "../index";

export const handleStreamingFinished =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (set: (partial: Partial<ChatStore>) => void, get: () => ChatStore) => () => {
    // TODO: commented while we have the same in handleSetMessages
    // if (get().queuedUserAction) {
    //   void get().executeQueuedAction();
    // }
  };

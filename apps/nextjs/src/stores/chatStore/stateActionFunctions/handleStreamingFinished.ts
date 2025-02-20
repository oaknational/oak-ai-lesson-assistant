import type { ChatSetter, ChatGetter } from "../types";

export const handleStreamingFinished =
  (set: ChatSetter, get: ChatGetter) => () => {
    get().scrollToBottom();

    // TODO: commented while we have the same in handleSetMessages
    // if (get().queuedUserAction) {
    //   void get().executeQueuedAction();
    // }
  };

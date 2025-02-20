import type { ChatSetter, ChatGetter } from "../types";

export const handleStreamingFinished =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (set: ChatSetter, get: ChatGetter) => () => {
    get().scrollToBottom();

    // TODO: commented while we have the same in handleSetMessages
    // if (get().queuedUserAction) {
    //   void get().executeQueuedAction();
    // }
  };

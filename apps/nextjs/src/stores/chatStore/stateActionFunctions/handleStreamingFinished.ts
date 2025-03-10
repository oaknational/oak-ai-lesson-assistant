import type { ChatSetter, ChatGetter } from "../types";

export const handleStreamingFinished =
  (set: ChatSetter, get: ChatGetter) => () => {
    get().actions.scrollToBottom();
  };

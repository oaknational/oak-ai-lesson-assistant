import type { ChatGetter, ChatSetter } from "../types";

export const handleStreamingFinished =
  (set: ChatSetter, get: ChatGetter) => () => {
    get().actions.scrollToBottom();
  };

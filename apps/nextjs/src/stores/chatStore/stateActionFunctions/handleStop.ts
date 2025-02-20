import type { ChatSetter, ChatGetter } from "../types";

export const handleStop = (set: ChatSetter, get: ChatGetter) => () => {
  if (get().queuedUserAction) {
    set({ queuedUserAction: null });
  } else {
    get().aiSdkActions.stop();
  }
};

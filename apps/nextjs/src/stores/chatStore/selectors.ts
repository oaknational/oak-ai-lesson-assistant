import type { ChatState } from ".";

/**
 * @example const canAppend = useChatStore(canAppend);
 */
export const canAppendSelector = (store: ChatState) =>
  store.initialMessages !== null &&
  (store.ailaStreamingStatus === "Idle" ||
    (store.ailaStreamingStatus === "Moderating" && !store.queuedUserAction));

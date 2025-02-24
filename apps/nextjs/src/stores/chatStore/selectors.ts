import type { ChatState } from ".";

/**
 * @example const canAppend = useChatStore(canAppend);
 */
export const canAppendSelector = (store: ChatState) =>
  store.ailaStreamingStatus === "Idle" ||
  (store.ailaStreamingStatus === "Moderating" && !store.queuedUserAction);

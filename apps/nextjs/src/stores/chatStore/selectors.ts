import type { ChatStore } from ".";

/**
 * @example const canAppend = useChatStore(canAppend);
 */
export const canAppendSelector = (store: ChatStore) =>
  store.ailaStreamingStatus === "Idle" ||
  (store.ailaStreamingStatus === "Moderating" && !store.queuedUserAction);

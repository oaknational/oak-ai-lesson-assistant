import { aiLogger } from "@oakai/logger";

import type { ChatStore } from "../index";

const log = aiLogger("chat:store");

export const handleScrollToBottom =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (set: (partial: Partial<ChatStore>) => void, get: () => ChatStore) => () => {
    const { chatAreaRef } = get();
    if (!chatAreaRef?.current) {
      return;
    }
    const element = chatAreaRef.current;
    log.info("Scrolling to bottom");
    element.scrollTo(0, element.scrollHeight);
  };

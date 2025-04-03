import { aiLogger } from "@oakai/logger";

import type { ChatGetter, ChatSetter } from "../types";

const log = aiLogger("chat:store");

export const handleScrollToBottom =
  (set: ChatSetter, get: ChatGetter) => () => {
    const { chatAreaRef } = get();
    if (!chatAreaRef?.current) {
      return;
    }
    const element = chatAreaRef.current;
    log.info("Scrolling to bottom");
    element.scrollTo(0, element.scrollHeight);
  };

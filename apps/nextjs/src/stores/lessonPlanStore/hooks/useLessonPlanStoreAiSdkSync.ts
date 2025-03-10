import { useEffect } from "react";

import { useLessonPlanActions } from "@/stores/AilaStoresProvider";
import type { AiMessage } from "@/stores/chatStore/types";

export const useLessonPlanStoreAiSdkSync = (
  messages: AiMessage[],
  isLoading: boolean,
) => {
  const { messagesUpdated } = useLessonPlanActions();

  useEffect(() => {
    messagesUpdated(messages);
  }, [messages, isLoading, messagesUpdated]);
};

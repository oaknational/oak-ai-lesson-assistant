import { useEffect } from "react";

import { useLessonPlanStore } from "@/stores/AilaStoresProvider";
import type { AiMessage } from "@/stores/chatStore/types";

export const useLessonPlanStoreAiSdkSync = (
  messages: AiMessage[],
  isLoading: boolean,
) => {
  const messagesUpdated = useLessonPlanStore((state) => state.messagesUpdated);

  useEffect(() => {
    messagesUpdated(messages);
  }, [messages, isLoading, messagesUpdated]);
};

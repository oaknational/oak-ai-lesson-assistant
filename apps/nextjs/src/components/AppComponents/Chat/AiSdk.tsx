import { useEffect } from "react";
import { toast } from "react-hot-toast";

import { generateMessageId } from "@oakai/aila/src/helpers/chat/generateMessageId";
import { parseMessageParts } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import { useChat } from "ai/react";
import { nanoid } from "nanoid";
import { usePathname } from "next/navigation";
import { useChatStoreAiSdkSync } from "src/stores/chatStore/hooks/useChatStoreAiSdkSync";
import { useLessonPlanStoreAiSdkSync } from "src/stores/lessonPlanStore/hooks/useLessonPlanStoreAiSdkSync";

import { useTranslation } from "@/components/ContextProviders/LanguageContext";
import useAnalytics from "@/lib/analytics/useAnalytics";
import {
  useChatActions,
  useChatStore,
  useLessonPlanActions,
  useLessonPlanStore,
} from "@/stores/AilaStoresProvider";

import { findMessageIdFromContent } from "./Chat/utils";
import { isAccountLocked } from "./chat-message/protocol";

const log = aiLogger("chat");

export type AiSdkProps = {
  id: string;
};

function useActionMessages() {
  const analytics = useAnalytics();

  return {
    invokeActionMessages: (messageContent: string) => {
      const shouldShowLockedPage = parseMessageParts(messageContent)
        .map((p) => p.document)
        .some(isAccountLocked);

      if (shouldShowLockedPage) {
        analytics.reset();
        window.location.href = "/legal/account-locked";
      }
    },
  };
}

export function AiSdk({ id }: Readonly<AiSdkProps>) {
  const path = usePathname();

  const initialMessages = useChatStore((state) => state.initialMessages);
  const lessonPlan = useLessonPlanStore((state) => state.lessonPlan);
  const chatActions = useChatActions();
  const lessonPlanActions = useLessonPlanActions();
  const { language } = useTranslation();
  // TODO: move to chat store
  const { invokeActionMessages } = useActionMessages();

  const {
    messages,
    append,
    reload,
    stop: stopStreaming,
    isLoading,
  } = useChat({
    sendExtraMessageFields: true,
    // NOTE: these initial messages are used by the chat endpoint
    initialMessages,
    generateId: () => generateMessageId({ role: "user" }),
    id,
    body: {
      id,
      options: {
        useRag: true,
        temperature: 0.7,
        language: language === "en" ? "english" : "ukrainian",
      },
    },
    fetch(input: RequestInfo | URL, init?: RequestInit | undefined) {
      lessonPlanActions.messageStarted();
      return fetch(input, init);
    },
    onError(error) {
      Sentry.captureException(new Error("Use chat error"), {
        extra: { originalError: error },
      });
      log.error("UseChat error", { error, messages });
    },
    onResponse(response) {
      log.info("Chat: On Response");

      // TODO: create onResponse handler in store and call from there
      chatActions.scrollToBottom();

      if (response.status === 401) {
        toast.error(response.statusText);
      }
      if (!path?.includes("chat/[id]")) {
        window.history.pushState({}, "", `/aila/${id}`);
      }
    },
    onFinish(response) {
      log.info("Chat: On Finish", new Date().toISOString(), {
        response,
        path,
      });

      invokeActionMessages(response.content);

      chatActions.streamingFinished();
      lessonPlanActions.messageFinished();
    },
  });

  useEffect(() => {
    /**
     * This is a hack to ensure that the assistant messages have a stable id
     * across server and client.
     * We should move away from this either when the vercel/ai package supports it
     * natively, or when we move away from streaming.
     */
    return messages.forEach((message) => {
      if (message.role !== "assistant") {
        return;
      }

      const idIsStable = message.id.startsWith("a-");
      if (idIsStable) {
        return;
      }

      const idFromContent = findMessageIdFromContent(message);
      if (idFromContent) {
        message.id = idFromContent;
        return;
      }

      message.id = "TEMP_PENDING_" + nanoid();
    });
  }, [messages]);

  // Hooks to update the Zustand stores
  useChatStoreAiSdkSync(messages, isLoading, stopStreaming, append, reload);
  useLessonPlanStoreAiSdkSync(messages, isLoading);

  return null;
}

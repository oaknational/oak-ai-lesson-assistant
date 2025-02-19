import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";

import { generateMessageId } from "@oakai/aila/src/helpers/chat/generateMessageId";
import { parseMessageParts } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";
import type { Message } from "ai";
import { useChat } from "ai/react";
import { nanoid } from "nanoid";
import { redirect, usePathname } from "next/navigation";
import { useChatStoreAiSdkSync } from "src/stores/chatStore/hooks/useChatStoreAiSdkSync";
import { useLessonPlanStoreAiSdkSync } from "src/stores/lessonPlanStore/hooks/useLessonPlanStoreAiSdkSync";

import useAnalytics from "@/lib/analytics/useAnalytics";
import { useChatStore, useLessonPlanStore } from "@/stores/AilaStoresProvider";
import { trpc } from "@/utils/trpc";

import { findMessageIdFromContent } from "../AppComponents/Chat/Chat/utils";
import { isAccountLocked } from "../AppComponents/Chat/chat-message/protocol";

const log = aiLogger("chat");

export type ChatProviderProps = {
  id: string;
  children: React.ReactNode;
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

function isValidMessageRole(role: unknown): role is Message["role"] {
  return (
    typeof role === "string" &&
    ["system", "assistant", "user", "data"].includes(role)
  );
}

export function ChatProvider({ id, children }: Readonly<ChatProviderProps>) {
  const { data: chat, isLoading: isChatLoading } =
    trpc.chat.appSessions.getChat.useQuery(
      { id },
      {
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        staleTime: 0,
      },
    );

  const trpcUtils = trpc.useUtils();

  const path = usePathname();
  const [hasFinished, setHasFinished] = useState(true);

  const hasAppendedInitialMessage = useRef<boolean>(false);

  const lessonPlanSnapshot = useRef<LooseLessonPlan>({});

  const streamingFinished = useChatStore((state) => state.streamingFinished);
  const scrollToBottom = useChatStore((state) => state.scrollToBottom);
  const messageStarted = useLessonPlanStore((state) => state.messageStarted);
  const messageFinished = useLessonPlanStore((state) => state.messageFinished);

  /******************* Functions *******************/

  const { invokeActionMessages } = useActionMessages();

  /******************* Streaming of all chat starts from messages here *******************/
  const initialMessages = useMemo(() => {
    return chat?.messages?.filter((m) =>
      isValidMessageRole(m.role),
    ) as Message[];
  }, [chat?.messages]);

  const {
    messages,
    append,
    reload,
    stop: stopStreaming,
    isLoading,
  } = useChat({
    sendExtraMessageFields: true,
    initialMessages,
    generateId: () => generateMessageId({ role: "user" }),
    id,
    body: {
      id,
      lessonPlan: chat?.lessonPlan,
      options: {
        useRag: true,
        temperature: 0.7,
      },
    },
    fetch(input: RequestInfo | URL, init?: RequestInit | undefined) {
      lessonPlanSnapshot.current = chat?.lessonPlan ?? {};
      messageStarted();
      return fetch(input, init);
    },
    onError(error) {
      Sentry.captureException(new Error("Use chat error"), {
        extra: { originalError: error },
      });
      log.error("UseChat error", { error, messages });
      setHasFinished(true);
    },
    onResponse(response) {
      log.info("Chat: On Response");

      // TODO: create onResponse handler in store and call from there
      scrollToBottom();

      if (response.status === 401) {
        toast.error(response.statusText);
        setHasFinished(true);
      }
      if (hasFinished) {
        setHasFinished(false);
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

      void trpcUtils.chat.appSessions.getChat
        .invalidate({ id })
        .catch((err) => {
          log.error("Failed to invalidate chat cache", err);
        });

      setHasFinished(true);
      streamingFinished();
      messageFinished();
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

  const storeAppend = useChatStore((state) => state.append);
  useEffect(() => {
    if (chat?.startingMessage && !hasAppendedInitialMessage.current) {
      storeAppend(chat.startingMessage);
      hasAppendedInitialMessage.current = true;
    }
  }, [chat?.startingMessage, storeAppend, hasAppendedInitialMessage]);

  /**
   *  Update the lesson plan if the chat has finished updating
   *  Fetch the state from the last "state" command in the most recent assistant message
   */
  useEffect(() => {
    if (!hasFinished || !messages) return;
    void trpcUtils.chat.appSessions.getChat.invalidate({ id }).catch((err) => {
      log.error("Failed to invalidate chat cache", err);
    });
  }, [id, trpcUtils.chat.appSessions.getChat, hasFinished, messages]);

  if (!chat && !isChatLoading) {
    redirect("/aila");
  }

  return isChatLoading ? null : children;
}

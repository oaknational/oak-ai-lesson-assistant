import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-hot-toast";

import { generateMessageId } from "@oakai/aila/src/helpers/chat/generateMessageId";
import { parseMessageParts } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import type {
  AilaPersistedChat,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { Moderation } from "@oakai/db";
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";
import type { ChatRequestOptions, CreateMessage, Message } from "ai";
import { useChat } from "ai/react";
import { nanoid } from "nanoid";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useChatStoreAiSdkSync } from "src/stores/chatStore/hooks/useChatStoreAiSdkSync";
import { useLessonPlanStoreAiSdkSync } from "src/stores/lessonPlanStore/hooks/useLessonPlanStoreAiSdkSync";

import { useLessonPlanTracking } from "@/lib/analytics/lessonPlanTrackingContext";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { useChatStore, useLessonPlanStore } from "@/stores/AilaStoresProvider";
import { trpc } from "@/utils/trpc";

import { findMessageIdFromContent } from "../AppComponents/Chat/Chat/utils";
import {
  isAccountLocked,
  isModeration,
} from "../AppComponents/Chat/chat-message/protocol";

const log = aiLogger("chat");

export type ChatContextProps = {
  id: string;
  chat: AilaPersistedChat | undefined;
  initialModerations: Moderation[];
  toxicModeration: PersistedModerationBase | null;
  lastModeration: PersistedModerationBase | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  // ailaStreamingStatus: AilaStreamingStatus;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => Promise<string | null | undefined>;
  // reload: () => void;
  // stop: () => void;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  chatAreaRef: React.RefObject<HTMLDivElement>;
  // queuedUserAction: string | null;
  // executeQueuedAction: () => Promise<void>;
};

export const ChatContext = createContext<ChatContextProps | null>(null);

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

function getModerationFromMessage(message?: { content: string }) {
  if (!message) {
    return;
  }
  const messageParts = parseMessageParts(message.content);
  const moderation = messageParts.map((p) => p.document).find(isModeration);

  return moderation;
}

function isValidMessageRole(role: unknown): role is Message["role"] {
  return (
    typeof role === "string" &&
    ["system", "assistant", "user", "data"].includes(role)
  );
}

export function ChatProvider({ id, children }: Readonly<ChatProviderProps>) {
  const {
    data: chat,
    isLoading: isChatLoading,
    refetch: refetchChat,
  } = trpc.chat.appSessions.getChat.useQuery(
    { id },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
  );
  const {
    data: moderations,
    isLoading: isModerationsLoading,
    refetch: refetchModerations,
  } = trpc.chat.appSessions.getModerations.useQuery(
    { id },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
  );
  // Ensure that we re-fetch on mount
  useEffect(() => {
    void refetchChat();
    void refetchModerations();
  }, [refetchChat, refetchModerations]);
  const trpcUtils = trpc.useUtils();

  const lessonPlanTracking = useLessonPlanTracking();
  const shouldTrackStreamFinished = useRef(false);

  const [lastModeration, setLastModeration] =
    useState<PersistedModerationBase | null>(
      moderations?.[moderations.length - 1] ?? null,
    );

  const router = useRouter();
  const path = usePathname();
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [hasFinished, setHasFinished] = useState(true);

  const hasAppendedInitialMessage = useRef<boolean>(false);

  const lessonPlanSnapshot = useRef<LooseLessonPlan>({});

  const streamingFinished = useChatStore((state) => state.streamingFinished);
  const messageStarted = useLessonPlanStore((state) => state.messageStarted);
  const messageFinished = useLessonPlanStore((state) => state.messageFinished);
  const getLessonPlanStoreState = useLessonPlanStore((state) => state.getState);

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
    input,
    setInput,
    setMessages,
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

      chatAreaRef.current?.scrollTo(0, chatAreaRef.current?.scrollHeight);
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

      const messageModeration = getModerationFromMessage(response);
      if (messageModeration?.id) {
        setLastModeration({
          categories: messageModeration.categories,
          id: messageModeration.id,
        });
      }

      invokeActionMessages(response.content);

      void trpcUtils.chat.appSessions.getChat
        .invalidate({ id })
        .catch((err) => {
          log.error("Failed to invalidate chat cache", err);
        });

      setHasFinished(true);
      shouldTrackStreamFinished.current = true;
      chatAreaRef.current?.scrollTo(0, chatAreaRef.current?.scrollHeight);
      streamingFinished();
      messageFinished();

      lessonPlanTracking.onStreamFinished({
        prevLesson: getLessonPlanStoreState().lastLessonPlan,
        nextLesson: getLessonPlanStoreState().lessonPlan,
        messages,
      });
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

  /**
   *  If the state is being restored from a previous lesson plan, set the lesson plan
   */

  useEffect(() => {
    if (chat?.startingMessage && !hasAppendedInitialMessage.current) {
      void append({
        content: chat.startingMessage,
        role: "user",
      }).catch((err) => {
        log.error("Failed to append initial message", err);
        toast.error("Failed to start chat");
      });
      hasAppendedInitialMessage.current = true;
    }
  }, [chat?.startingMessage, append, router, path, hasAppendedInitialMessage]);

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

  /**
   * Get the sensitive moderation id and pass to dialog
   */

  const toxicInitialModeration = moderations?.find(isToxic) ?? null;

  const toxicModeration =
    lastModeration && isToxic(lastModeration)
      ? lastModeration
      : toxicInitialModeration;

  useEffect(() => {
    if (toxicModeration) {
      setMessages([]);
    }
  }, [toxicModeration, setMessages]);

  const value: ChatContextProps = useMemo(
    () => ({
      id,
      chat: chat ?? undefined,
      initialModerations: moderations ?? [],
      toxicModeration,
      hasFinished,
      hasAppendedInitialMessage,
      chatAreaRef,
      append,
      messages,
      isLoading,
      isStreaming: !hasFinished,
      lastModeration,
      input,
      setInput,
    }),
    [
      id,
      chat,
      moderations,
      toxicModeration,
      hasFinished,
      hasAppendedInitialMessage,
      chatAreaRef,
      messages,
      isLoading,
      lastModeration,
      input,
      setInput,
      append,
    ],
  );

  if (!chat && !isChatLoading) {
    redirect("/aila");
  }

  return (
    <ChatContext.Provider value={value}>
      {isChatLoading || isModerationsLoading ? null : children}
    </ChatContext.Provider>
  );
}

export function useLessonChat(): ChatContextProps {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }

  return context;
}

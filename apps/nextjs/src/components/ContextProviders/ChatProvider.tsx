import React, {
  createContext,
  useCallback,
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
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";
import type { ChatRequestOptions, CreateMessage, Message } from "ai";
import { useChat } from "ai/react";
import { nanoid } from "nanoid";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useChatStoreMirror } from "src/stores/chatStore/hooks/useChatStoreMirror";

import { useTemporaryLessonPlanWithStreamingEdits } from "@/hooks/useTemporaryLessonPlanWithStreamingEdits";
import { useLessonPlanTracking } from "@/lib/analytics/lessonPlanTrackingContext";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { useChatStore } from "@/stores/chatStore";
import { useModerationStore } from "@/stores/moderationStore";
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
  // initialModerations: Moderation[];
  // toxicModeration: PersistedModerationBase | null;
  // lastModeration: PersistedModerationBase | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  lessonPlan: LooseLessonPlan;
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
  // queueUserAction: (action: string) => void;
  // executeQueuedAction: () => Promise<void>;
};

export const ChatContext = createContext<ChatContextProps | null>(null);

export type ChatProviderProps = {
  id: string;
  children: React.ReactNode;
};

const messageHashes = {};

function clearHashCache() {
  for (const key in messageHashes) {
    if (Object.prototype.hasOwnProperty.call(messageHashes, key)) {
      delete messageHashes[key];
    }
  }
}

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

  const trpcUtils = trpc.useUtils();

  const lessonPlanTracking = useLessonPlanTracking();
  const shouldTrackStreamFinished = useRef(false);

  const setLastModeration = useModerationStore(
    (state) => state.setLastModeration,
  );
  const toxicModeration = useModerationStore((state) => state.toxicModeration);

  const router = useRouter();
  const path = usePathname();
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [hasFinished, setHasFinished] = useState(true);

  const hasAppendedInitialMessage = useRef<boolean>(false);

  const lessonPlanSnapshot = useRef<LooseLessonPlan>({});

  const [overrideLessonPlan, setOverrideLessonPlan] = useState<
    LooseLessonPlan | undefined
  >(undefined);

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

  const { tempLessonPlan, partialPatches, validPatches } =
    useTemporaryLessonPlanWithStreamingEdits({
      lessonPlan: chat?.lessonPlan ?? {},
      messages,
      isStreaming: !hasFinished,
      messageHashes,
    });

  // Handle queued user actions and messages

  const executeQueuedAction = useChatStore(
    (state) => state.executeQueuedAction,
  );

  useEffect(() => {
    if (hasFinished) {
      void executeQueuedAction();
    }
  }, [hasFinished, executeQueuedAction]);

  const handleReload = useCallback(() => {
    reload().catch((err) => {
      log.error("Failed to reload chat", err);
      toast.error("Failed to reload chat");
      Sentry.captureException(err);
    });
  }, [reload]);

  // Hooks to update the Zustand chat store mirror
  useChatStoreMirror(messages, isLoading, stopStreaming, append, handleReload);

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

  // Clear the hash cache each completed message
  useEffect(() => {
    clearHashCache();
  }, [hasFinished]);

  /**
   *  Update the lesson plan if the chat has finished updating
   *  Fetch the state from the last "state" command in the most recent assistant message
   */
  useEffect(() => {
    if (!hasFinished || !messages) return;
    void trpcUtils.chat.appSessions.getChat.invalidate({ id }).catch((err) => {
      log.error("Failed to invalidate chat cache", err);
    });
    if (shouldTrackStreamFinished.current) {
      lessonPlanTracking.onStreamFinished({
        prevLesson: lessonPlanSnapshot.current,
        nextLesson: tempLessonPlan,
        messages,
      });
      shouldTrackStreamFinished.current = false;
    }
  }, [
    id,
    trpcUtils.chat.appSessions.getChat,
    hasFinished,
    messages,
    lessonPlanTracking,
    tempLessonPlan,
  ]);

  /**
   * Get the sensitive moderation id and pass to dialog
   */

  useEffect(() => {
    if (toxicModeration) {
      setOverrideLessonPlan({});
    }
  }, [toxicModeration, setMessages]);

  const value: ChatContextProps = useMemo(
    () => ({
      id,
      chat: chat ?? undefined,
      lessonPlan: overrideLessonPlan ?? tempLessonPlan,
      hasFinished,
      hasAppendedInitialMessage,
      chatAreaRef,
      append,
      messages,
      isLoading,
      isStreaming: !hasFinished,
      input,
      setInput,
      partialPatches,
      validPatches,
    }),
    [
      id,
      chat,
      tempLessonPlan,
      hasFinished,
      hasAppendedInitialMessage,
      chatAreaRef,
      messages,
      isLoading,
      input,
      setInput,
      append,
      partialPatches,
      validPatches,
      overrideLessonPlan,
    ],
  );

  if (!chat && !isChatLoading) {
    redirect("/aila");
  }

  return (
    <ChatContext.Provider value={value}>
      {isChatLoading ? null : children}
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

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

import { redirect, usePathname } from "#next/navigation";
import { generateMessageId } from "@oakai/aila/src/helpers/chat/generateMessageId";
import { parseMessageParts } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import {
  AilaPersistedChat,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { Moderation } from "@oakai/db";
import * as Sentry from "@sentry/nextjs";
import { Message, nanoid } from "ai";
import { ChatRequestOptions, CreateMessage } from "ai";
import { useChat } from "ai/react";
import { useTemporaryLessonPlanWithStreamingEdits } from "hooks/useTemporaryLessonPlanWithStreamingEdits";

import { useLessonPlanTracking } from "@/lib/analytics/lessonPlanTrackingContext";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { trpc } from "@/utils/trpc";

import {
  AilaStreamingStatus,
  useAilaStreamingStatus,
} from "../AppComponents/Chat/Chat/hooks/useAilaStreamingStatus";
import { findMessageIdFromContent } from "../AppComponents/Chat/Chat/utils";
import {
  isAccountLocked,
  isModeration,
} from "../AppComponents/Chat/chat-message/protocol";

export type ChatContextProps = {
  id: string;
  chat: AilaPersistedChat | undefined;
  initialModerations: Moderation[];
  toxicModeration: PersistedModerationBase | null;
  lastModeration: PersistedModerationBase | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  lessonPlan: LooseLessonPlan;
  ailaStreamingStatus: AilaStreamingStatus;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => Promise<string | null | undefined>;
  reload: () => void;
  stop: () => void;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  chatAreaRef: React.RefObject<HTMLDivElement>;
  queuedUserAction: string | null;
  queueUserAction: (action: string) => void;
  executeQueuedAction: () => Promise<void>;
};

const ChatContext = createContext<ChatContextProps | null>(null);

export type ChatProviderProps = {
  id: string;
  children: React.ReactNode;
};

const messageHashes = {};

function clearHashCache() {
  for (const key in messageHashes) {
    if (messageHashes.hasOwnProperty(key)) {
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

/**
 * This is a hack to ensure that the assistant messages have a stable id
 * across server and client.
 * We should move away from this either when the vercel/ai package supports it
 * natively, or when we move away from streaming.
 */
function useStableMessageId(messages: Message[]) {
  useEffect(() => {
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
}

function useAppendInitialMessage({
  startingMessage,
  append,
}: {
  startingMessage: string | undefined;
  append: (
    message: Message | CreateMessage,
  ) => Promise<string | null | undefined>;
}) {
  const hasAppendedInitialMessage = useRef<boolean>(false);

  useEffect(() => {
    if (startingMessage && !hasAppendedInitialMessage.current) {
      append({
        content: startingMessage,
        role: "user",
      });
      hasAppendedInitialMessage.current = true;
    }
  }, [startingMessage, append, hasAppendedInitialMessage]);
}

function useQueueUserAction({
  hasFinished,
  append,
  reload,
}: {
  hasFinished: boolean;
  append: (
    message: Message | CreateMessage,
  ) => Promise<string | null | undefined>;
  reload: () => void;
}) {
  const [queuedUserAction, setQueuedUserAction] = useState<string | null>(null);
  const isExecutingAction = useRef(false);

  const queueUserAction = useCallback((action: string) => {
    setQueuedUserAction(action);
  }, []);

  const clearQueuedUserAction = useCallback(() => {
    setQueuedUserAction(null);
  }, []);

  const executeQueuedAction = useCallback(async () => {
    if (!queuedUserAction || !hasFinished || isExecutingAction.current) return;

    isExecutingAction.current = true;
    const actionToExecute = queuedUserAction;
    setQueuedUserAction(null);

    try {
      if (actionToExecute === "continue") {
        await append({
          content: "Continue",
          role: "user",
        });
      } else if (actionToExecute === "regenerate") {
        reload();
      } else {
        // Assume it's a user message
        await append({
          content: actionToExecute,
          role: "user",
        });
      }
    } catch (error) {
      console.error("Error handling queued action:", error);
    } finally {
      isExecutingAction.current = false;
    }
  }, [queuedUserAction, hasFinished, append, reload]);

  useEffect(() => {
    if (hasFinished) {
      executeQueuedAction();
    }
  }, [hasFinished, executeQueuedAction]);

  return {
    queueUserAction,
    clearQueuedUserAction,
    queuedUserAction,
    executeQueuedAction,
  };
}

export function ChatProvider({ id, children }: Readonly<ChatProviderProps>) {
  const {
    data: chat,
    isLoading: isChatLoading,
    refetch: refetchChat,
  } = trpc.chat.appSessions.getChat.useQuery({ id });
  const {
    data: moderations,
    isLoading: isModerationsLoading,
    refetch: refetchModerations,
  } = trpc.chat.appSessions.getModerations.useQuery({ id });
  // Ensure that we re-fetch on mount
  useEffect(() => {
    refetchChat();
    refetchModerations();
  }, [refetchChat, refetchModerations]);
  const trpcUtils = trpc.useUtils();

  const lessonPlanTracking = useLessonPlanTracking();
  const lessonPlanSnapshot = useRef<LooseLessonPlan>({});

  const [lastModeration, setLastModeration] =
    useState<PersistedModerationBase | null>(
      moderations?.[moderations.length - 1] ?? null,
    );

  const path = usePathname();
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [hasFinished, setHasFinished] = useState(true);

  const [overrideLessonPlan, setOverrideLessonPlan] = useState<
    LooseLessonPlan | undefined
  >(undefined);

  /******************* Functions *******************/

  const { invokeActionMessages } = useActionMessages();

  /******************* Streaming of all chat starts from messages here *******************/

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
    initialMessages: chat?.messages ?? [],
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
      console.error("UseChat error", { error, messages });
      setHasFinished(true);
    },
    onResponse(response) {
      console.log("Chat: On Response");

      chatAreaRef.current?.scrollTo(0, chatAreaRef.current?.scrollHeight);
      if (response.status === 401) {
        toast.error(response.statusText);
        setHasFinished(true);
      }
      if (hasFinished) {
        setHasFinished(false);
      }
    },
    onFinish(response) {
      console.log("Chat: On Finish", new Date().toISOString(), {
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

      trpcUtils.chat.appSessions.getChat.invalidate({ id });
      clearHashCache();

      setHasFinished(true);

      lessonPlanTracking.onStreamFinished({
        prevLesson: lessonPlanSnapshot.current,
        nextLesson: tempLessonPlan,
        messages,
      });

      chatAreaRef.current?.scrollTo(0, chatAreaRef.current?.scrollHeight);
    },
  });

  useStableMessageId(messages);
  useAppendInitialMessage({ startingMessage: chat?.startingMessage, append });

  // NOTE: this hook also returns validPatches and partialPatches, but we don't use them
  const { tempLessonPlan } = useTemporaryLessonPlanWithStreamingEdits({
    lessonPlan: chat?.lessonPlan ?? {},
    messages,
    isStreaming: !hasFinished,
    messageHashes,
  });

  // Handle queued user actions and messages
  const {
    queuedUserAction,
    queueUserAction,
    clearQueuedUserAction,
    executeQueuedAction,
  } = useQueueUserAction({ hasFinished, append, reload });

  const stop = useCallback(() => {
    if (queuedUserAction) {
      clearQueuedUserAction();
    } else {
      stopStreaming();
    }
  }, [queuedUserAction, clearQueuedUserAction, stopStreaming]);

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
      setOverrideLessonPlan({});
    }
  }, [toxicModeration, setMessages]);

  const ailaStreamingStatus = useAilaStreamingStatus({ isLoading, messages });

  const value: ChatContextProps = useMemo(
    () => ({
      id,
      chat: chat ?? undefined,
      initialModerations: moderations ?? [],
      toxicModeration,
      lessonPlan: overrideLessonPlan ?? tempLessonPlan,
      chatAreaRef,
      append,
      messages,
      ailaStreamingStatus,
      isLoading,
      isStreaming: !hasFinished,
      lastModeration,
      reload,
      stop,
      input,
      setInput,
      queuedUserAction,
      queueUserAction,
      executeQueuedAction,
    }),
    [
      id,
      chat,
      moderations,
      toxicModeration,
      tempLessonPlan,
      chatAreaRef,
      messages,
      ailaStreamingStatus,
      isLoading,
      lastModeration,
      reload,
      stop,
      input,
      setInput,
      append,
      overrideLessonPlan,
      queuedUserAction,
      queueUserAction,
      executeQueuedAction,
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

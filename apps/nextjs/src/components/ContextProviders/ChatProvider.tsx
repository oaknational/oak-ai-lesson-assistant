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
  LessonPlanKeys,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { camelCaseToTitleCase } from "@oakai/core/src/utils/camelCaseConversion";
import type { Moderation } from "@oakai/db";
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";
import type { Message } from "ai";
import type { ChatRequestOptions, CreateMessage } from "ai";
import { useChat } from "ai/react";
import { nanoid } from "nanoid";
import { usePathname, useRouter } from "next/navigation";

import { useLessonPlanScrollManagement } from "../../hooks/useLessonPlanScrollManagement";
import { useLessonPlanTracking } from "../../lib/analytics/lessonPlanTrackingContext";
import useAnalytics from "../../lib/analytics/useAnalytics";
import { nextSectionsToGenerate } from "../../lib/lessonPlan/nextSectionToGenerate";
import { useLessonPlanManager } from "../../lib/lessonPlan/useLessonPlanManager";
import { trpc } from "../../utils/trpc";
import type { AilaStreamingStatus } from "../AppComponents/Chat/Chat/hooks/useAilaStreamingStatus";
import { useAilaStreamingStatus } from "../AppComponents/Chat/Chat/hooks/useAilaStreamingStatus";
import { findMessageIdFromContent } from "../AppComponents/Chat/Chat/utils";
import {
  isAccountLocked,
  isModeration,
} from "../AppComponents/Chat/chat-message/protocol";

const log = aiLogger("chat");

function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(
      () => {
        if (Date.now() - lastExecuted.current >= delay) {
          setThrottledValue(value);
          lastExecuted.current = Date.now();
        }
      },
      delay - (Date.now() - lastExecuted.current),
    );

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
}

export type ChatContextProps = {
  ailaStreamingStatus: AilaStreamingStatus;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => Promise<string | null | undefined>;
  chat: AilaPersistedChat | undefined | null;
  chatAreaRef: React.RefObject<HTMLDivElement>;
  executeQueuedAction: () => Promise<void>;
  id: string;
  initialModerations: Moderation[];
  input: string;
  isLoading: boolean;
  isStreaming: boolean;
  iteration: number | undefined;
  lastModeration: PersistedModerationBase | null;
  lessonPlan: LooseLessonPlan;
  messages: Message[];
  queuedUserAction: string | null;
  queueUserAction: (action: string) => void;
  reload: () => void;
  sectionRefs: Record<
    LessonPlanKeys,
    React.MutableRefObject<HTMLDivElement | null>
  >;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setSectionRef: (section: LessonPlanKeys, el: HTMLDivElement | null) => void;
  stop: () => void;
  streamingSection: LessonPlanKeys | undefined;
  streamingSectionCompleted: LessonPlanKeys | undefined;
  streamingSections: LessonPlanKeys[] | undefined;
  toxicModeration: PersistedModerationBase | null;
};

const ChatContext = createContext<ChatContextProps | null>(null);

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
    refetchChat();
    refetchModerations();
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
  const { lessonPlanManager, lessonPlan, iteration } = useLessonPlanManager();

  const [overrideLessonPlan, setOverrideLessonPlan] = useState<
    LooseLessonPlan | undefined
  >(undefined);

  /******************* Functions *******************/

  const { invokeActionMessages } = useActionMessages();

  /******************* Streaming of all chat starts from messages here *******************/

  const {
    messages: chatMessages,
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
      log.error("UseChat error", { error, chatMessages });
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
      setStreamingSectionCompleted(undefined);
      setHasFinished(true);
      shouldTrackStreamFinished.current = true;
      chatAreaRef.current?.scrollTo(0, chatAreaRef.current?.scrollHeight);
    },
  });

  // We don't stream the text to the UI so we only need to process
  // them once every second

  const messages = useThrottle(chatMessages, 1000);

  useEffect(() => {
    if (chat?.lessonPlan) {
      log.info(
        "Setting lesson plan from chat",
        chat?.iteration,
        chat.lessonPlan,
      );
      lessonPlanManager.setLessonPlanWithDelay(chat.lessonPlan, chat.iteration);
    }
  }, [chat?.lessonPlan, chat?.iteration, lessonPlanManager]);

  useEffect(() => {
    const loggingLessonPlan = chat?.lessonPlan;
    if (loggingLessonPlan) {
      const keys = (Object.keys(loggingLessonPlan) as LessonPlanKeys[]).filter(
        (k) => loggingLessonPlan[k],
      );
      log.info(
        "Updated chat from server",
        chat?.iteration,
        `${keys.length} keys`,
        keys.join("|"),
      );
    }
  }, [chat?.lessonPlan, chat?.iteration]);

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

  // Handle queued user actions and messages

  const [queuedUserAction, setQueuedUserAction] = useState<string | null>(null);
  const isExecutingAction = useRef(false);

  const queueUserAction = useCallback((action: string) => {
    setQueuedUserAction(action);
  }, []);

  const generateContinueAction = useCallback(() => {
    const sectionsToGenerate = nextSectionsToGenerate(lessonPlan);
    if (sectionsToGenerate.length === 0) {
      return "Continue (with special instructions: check the lesson plan for consistency and correctness)";
    } else {
      const sentenceCaseSections = sectionsToGenerate
        .map((section) => camelCaseToTitleCase(section))
        .join(", ")
        .replace(/, ([^,]*)$/, " and $1");
      return `Continue (with special instructions: Generate the ${sentenceCaseSections} section${sectionsToGenerate.length > 1 ? "s" : ""})`;
    }
  }, [lessonPlan]);

  const executeQueuedAction = useCallback(async () => {
    if (!queuedUserAction || !hasFinished || isExecutingAction.current) return;

    isExecutingAction.current = true;
    const actionToExecute = queuedUserAction;
    setQueuedUserAction(null);

    try {
      if (actionToExecute === "continue") {
        const continueAction = generateContinueAction();
        await append({
          content: continueAction,
          role: "user",
        });
      } else if (actionToExecute === "regenerate") {
        void reload();
      } else {
        // Assume it's a user message
        await append({
          content: actionToExecute,
          role: "user",
        });
      }
    } catch (error) {
      log.error("Error handling queued action:", error);
    } finally {
      isExecutingAction.current = false;
    }
  }, [append, generateContinueAction, hasFinished, queuedUserAction, reload]);

  useEffect(() => {
    if (hasFinished) {
      void executeQueuedAction();
    }
  }, [hasFinished, executeQueuedAction]);

  const stop = useCallback(() => {
    if (queuedUserAction) {
      setQueuedUserAction(null);
    } else {
      stopStreaming();
    }
  }, [queuedUserAction, setQueuedUserAction, stopStreaming]);

  /**
   *  If the state is being restored from a previous lesson plan, set the lesson plan
   */

  useEffect(() => {
    if (chat?.startingMessage && !hasAppendedInitialMessage.current) {
      void append({
        content: chat.startingMessage,
        role: "user",
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
    const timeout = setTimeout(() => {
      // Delay fetching the lesson plan to ensure the UI has updated
      trpcUtils.chat.appSessions.getChat.invalidate({ id });
    }, 2000);
    if (shouldTrackStreamFinished.current) {
      lessonPlanTracking.onStreamFinished({
        prevLesson: lessonPlanSnapshot.current,
        nextLesson: lessonPlan,
        messages,
      });
      shouldTrackStreamFinished.current = false;
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [
    id,
    trpcUtils.chat.appSessions.getChat,
    hasFinished,
    messages,
    lessonPlanTracking,
    lessonPlan,
  ]);

  /**
   * Get the sensitive moderation id and pass to dialog
   */

  const toxicInitialModeration = moderations?.find(isToxic) ?? null;

  const toxicModeration =
    lastModeration && isToxic(lastModeration)
      ? lastModeration
      : toxicInitialModeration;

  const {
    status: ailaStreamingStatus,
    streamingSection,
    streamingSections,
  } = useAilaStreamingStatus({ isLoading, messages: chatMessages });

  const [streamingSectionCompleted, setStreamingSectionCompleted] = useState<
    LessonPlanKeys | undefined
  >(undefined);

  const { sectionRefs, setSectionRef } = useLessonPlanScrollManagement(
    streamingSection,
    streamingSectionCompleted,
  );

  const workingMessage = useRef<Message | undefined>(undefined);

  useEffect(() => {
    if (messages.length > 0) {
      workingMessage.current = messages[messages.length - 1];
    }
  }, [messages]);

  useEffect(() => {
    if (streamingSection !== streamingSectionCompleted) {
      if (workingMessage.current) {
        lessonPlanManager.onMessageUpdated(workingMessage.current);
      }
      setStreamingSectionCompleted(streamingSection);
    }
  }, [streamingSection, streamingSectionCompleted, lessonPlanManager]);

  useEffect(() => {
    if (toxicModeration) {
      setMessages([]);
      setOverrideLessonPlan({});
    }
  }, [toxicModeration, setMessages]);

  const value: ChatContextProps = useMemo(
    () => ({
      ailaStreamingStatus,
      append,
      chat,
      chatAreaRef,
      executeQueuedAction,
      hasAppendedInitialMessage,
      hasFinished,
      id,
      initialModerations: moderations ?? [],
      input,
      isLoading,
      isStreaming: !hasFinished,
      iteration,
      lastModeration,
      lessonPlan: overrideLessonPlan ?? lessonPlan,
      messages,
      queuedUserAction,
      queueUserAction,
      reload,
      setInput,
      stop,
      streamingSection,
      streamingSections,
      streamingSectionCompleted,
      toxicModeration,
      sectionRefs,
      setSectionRef,
    }),
    [
      ailaStreamingStatus,
      append,
      chat,
      chatAreaRef,
      executeQueuedAction,
      hasAppendedInitialMessage,
      hasFinished,
      id,
      input,
      isLoading,
      iteration,
      lastModeration,
      lessonPlan,
      messages,
      moderations,
      overrideLessonPlan,
      queuedUserAction,
      queueUserAction,
      reload,
      setInput,
      stop,
      streamingSection,
      streamingSections,
      streamingSectionCompleted,
      toxicModeration,
      sectionRefs,
      setSectionRef,
    ],
  );

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

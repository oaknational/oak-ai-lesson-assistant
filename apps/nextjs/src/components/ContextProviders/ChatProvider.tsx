import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-hot-toast";

import { usePathname, useRouter } from "#next/navigation";
import { generateMessageId } from "@oakai/aila/src/helpers/chat/generateMessageId";
import { parseMessageParts } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { Moderation } from "@oakai/db";
import * as Sentry from "@sentry/nextjs";
import { Message, nanoid } from "ai";
import { ChatRequestOptions, CreateMessage } from "ai";
import { useChat } from "ai/react";
import { deepClone } from "fast-json-patch";
import { useTemporaryLessonPlanWithStreamingEdits } from "hooks/useTemporaryLessonPlanWithStreamingEdits";

import { useLessonPlanTracking } from "@/lib/analytics/lessonPlanTrackingContext";
import useAnalytics from "@/lib/analytics/useAnalytics";

import {
  AilaStreamingStatus,
  useAilaStreamingStatus,
} from "../AppComponents/Chat/Chat/hooks/useAilaStreamingStatus";
import {
  findLatestServerSideState,
  findMessageIdFromContent,
} from "../AppComponents/Chat/Chat/utils";
import {
  isAccountLocked,
  isModeration,
} from "../AppComponents/Chat/chat-message/protocol";

export type ChatContextProps = {
  id: string;
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
};

const ChatContext = createContext<ChatContextProps | null>(null);

export type ChatProviderProps = {
  startingMessage?: string;
  initialMessages?: Message[];
  initialLessonPlan?: LooseLessonPlan;
  id: string;
  initialModerations: Moderation[];
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

export function ChatProvider({
  id,
  initialLessonPlan,
  initialModerations,
  initialMessages,
  startingMessage,
  children,
}: Readonly<ChatProviderProps>) {
  const [lessonPlan, setLessonPlan] = useState<LooseLessonPlan>({});
  const lessonPlanTracking = useLessonPlanTracking();
  const shouldTrackStreamFinished = useRef(false);

  const [lastModeration, setLastModeration] =
    useState<PersistedModerationBase | null>(
      initialModerations[initialModerations.length - 1] ?? null,
    );

  const router = useRouter();
  const path = usePathname();
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [hasFinished, setHasFinished] = useState(true);

  const hasAppendedInitialMessage = useRef<boolean>(false);

  /******************* Functions *******************/

  const setLessonPlanWithLogging = useCallback(
    (newLessonPlan: LooseLessonPlan, reason: string) => {
      const lessonToSet = deepClone(newLessonPlan);
      console.log("Set lesson plan", reason, { lessonToSet });
      setLessonPlan(lessonToSet);
    },
    [setLessonPlan],
  );

  const { invokeActionMessages } = useActionMessages();

  /******************* Streaming of all chat starts from messages here *******************/

  const {
    messages,
    append,
    reload,
    stop,
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
      lessonPlan,
      options: {
        useRag: true,
        temperature: 0.7,
      },
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
      if (!path?.includes("chat/[id]")) {
        window.history.pushState({}, "", `/aila/${id}`);
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

      if (messages) {
        const state = findLatestServerSideState(messages);
        if (state) {
          console.log("On Finish: Applying server-side state", { state });
          setLessonPlanWithLogging(state, "hasFinished");
        } else {
          console.log("On Finish: No server state found");
          setLessonPlanFromTempLessonPlan();
        }
      }

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
      lessonPlan,
      messages,
      isStreaming: !hasFinished,
      messageHashes,
    });

  const setLessonPlanFromTempLessonPlan = useCallback(() => {
    setLessonPlanWithLogging(tempLessonPlan, "setLessonPlanFromTempLessonPlan");
  }, [tempLessonPlan, setLessonPlanWithLogging]);

  /**
   *  If the state is being restored from a previous lesson plan, set the lesson plan
   */

  useEffect(() => {
    if (initialLessonPlan) {
      setLessonPlanWithLogging(initialLessonPlan, "initial");
    }
  }, [initialLessonPlan, setLessonPlanWithLogging]);

  useEffect(() => {
    if (startingMessage && !hasAppendedInitialMessage.current) {
      append({
        content: startingMessage,
        role: "user",
      });
      hasAppendedInitialMessage.current = true;
    }
  }, [startingMessage, append, router, path, hasAppendedInitialMessage]);

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
    const state = findLatestServerSideState(messages);
    if (!state) return;
    setLessonPlanWithLogging(state, "hasFinished");
    if (shouldTrackStreamFinished.current) {
      lessonPlanTracking.onStreamFinished({
        prevLesson: lessonPlan,
        nextLesson: state,
        messages,
      });
      shouldTrackStreamFinished.current = false;
    }
  }, [
    hasFinished,
    messages,
    setLessonPlanWithLogging,
    lessonPlanTracking,
    //lessonPlan, Deliberately do not add this dependency
  ]);

  /**
   * Get the sensitive moderation id and pass to dialog
   */

  const toxicInitialModeration = initialModerations.find(isToxic) ?? null;

  const toxicModeration =
    lastModeration && isToxic(lastModeration)
      ? lastModeration
      : toxicInitialModeration;

  const ailaStreamingStatus = useAilaStreamingStatus({ isLoading, messages });

  useEffect(() => {
    if (toxicModeration) {
      setMessages([]);
      setLessonPlan({});
    }
  }, [toxicModeration, setMessages]);

  const value: ChatContextProps = useMemo(
    () => ({
      id,
      initialModerations,
      toxicModeration,
      lessonPlan: tempLessonPlan ?? lessonPlan ?? {},
      setLessonPlan,
      hasFinished,
      hasAppendedInitialMessage,
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
      partialPatches,
      validPatches,
    }),
    [
      id,
      initialModerations,
      toxicModeration,
      lessonPlan,
      tempLessonPlan,
      setLessonPlan,
      hasFinished,
      hasAppendedInitialMessage,
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
      partialPatches,
      validPatches,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useLessonChat(): ChatContextProps {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }

  return context;
}

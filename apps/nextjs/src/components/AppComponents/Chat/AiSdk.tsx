import { useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";

import { generateMessageId } from "@oakai/aila/src/helpers/chat/generateMessageId";
import { parseMessageParts } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { aiLogger } from "@oakai/logger";

import { Chat, useChat } from "@ai-sdk/react";
import * as Sentry from "@sentry/nextjs";
import { TextStreamChatTransport } from "ai";
import type { ChatOnErrorCallback, ChatOnFinishCallback, UIMessage } from "ai";
import { nanoid } from "nanoid";
import { usePathname } from "next/navigation";

import {
  CHAT_STREAM_PROTOCOL,
  CHAT_STREAM_PROTOCOL_HEADER,
} from "@/app/api/chat/streamProtocol";
import useAnalytics from "@/lib/analytics/useAnalytics";
import {
  useChatActions,
  useChatStore,
  useLessonPlanActions,
} from "@/stores/AilaStoresProvider";
import { useChatStoreAiSdkSync } from "@/stores/chatStore/hooks/useChatStoreAiSdkSync";
import type { AiMessage, AiSdkActions } from "@/stores/chatStore/types";
import { useLessonPlanStoreAiSdkSync } from "@/stores/lessonPlanStore/hooks/useLessonPlanStoreAiSdkSync";
import { getAilaUrl } from "@/utils/getAilaUrl";

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

// The AI SDK stores messages as parts; the stores and the chat endpoint use
// plain text content
function toUIMessage(message: AiMessage): UIMessage[] {
  if (message.role === "data") {
    return [];
  }
  return [
    {
      id: message.id,
      role: message.role,
      parts: [{ type: "text", text: message.content }],
    },
  ];
}

function getTextContent(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

function toAiMessage(message: UIMessage): AiMessage {
  return {
    id: message.id,
    role: message.role,
    content: getTextContent(message),
  };
}

export function AiSdk({ id }: Readonly<AiSdkProps>) {
  const path = usePathname();

  const initialMessages = useChatStore((state) => state.initialMessages);
  const chatActions = useChatActions();
  const lessonPlanActions = useLessonPlanActions();

  // TODO: move to chat store
  const { invokeActionMessages } = useActionMessages();

  // The chat keeps the callbacks from its first render, so they read the
  // latest props and store actions through this ref
  const onError: ChatOnErrorCallback = (error) => {
    Sentry.captureException(new Error("Use chat error"), {
      extra: { originalError: error },
    });
    log.error("UseChat error", { error, messages: chat.messages });

    // Mark that an error occurred to prevent analytics tracking
    chatActions.streamingFailed();
  };
  const onFinish: ChatOnFinishCallback<UIMessage> = ({
    message,
    isAbort,
    isError,
  }) => {
    // Stopped and failed turns are handled by stop and onError
    if (isAbort || isError) {
      return;
    }
    log.info("Chat: On Finish", new Date().toISOString(), {
      message,
      path,
    });

    invokeActionMessages(getTextContent(message));

    chatActions.streamingFinished();
    lessonPlanActions.messageFinished();
  };
  const callbacks = useRef({ onError, onFinish });
  callbacks.current = { onError, onFinish };

  // Created here rather than by useChat, which stops the chats it creates when
  // it unmounts. That aborts the request, so leaving the page would lose the
  // turn, which AI SDK 4 let finish
  const [chat] = useState(
    () =>
      new Chat<UIMessage>({
        id,
        // NOTE: these initial messages are used by the chat endpoint
        messages: (initialMessages ?? []).flatMap(toUIMessage),
        generateId: () => generateMessageId({ role: "user" }),
        transport: new TextStreamChatTransport<UIMessage>({
          api: "/api/chat",
          headers: { [CHAT_STREAM_PROTOCOL_HEADER]: CHAT_STREAM_PROTOCOL },
          // The chat endpoint expects messages with text content
          prepareSendMessagesRequest: ({ messages }) => ({
            body: { id, messages: messages.map(toAiMessage) },
          }),
          async fetch(input: RequestInfo | URL, init?: RequestInit) {
            lessonPlanActions.messageStarted();
            const response = await fetch(input, init);
            log.info("Chat: On Response");

            // TODO: create onResponse handler in store and call from there
            chatActions.scrollToBottom();

            if (response.status === 401) {
              toast.error(response.statusText);
            }
            // Anything else, such as a page reached through a redirect, would
            // otherwise be shown as Aila's reply
            if (
              response.ok &&
              response.headers.get(CHAT_STREAM_PROTOCOL_HEADER) !==
                CHAT_STREAM_PROTOCOL
            ) {
              throw new Error(
                `Unexpected chat response: ${response.status} ${response.headers.get("content-type") ?? "no content type"}`,
              );
            }
            if (!path?.includes("chat/[id]")) {
              window.history.pushState({}, "", `${getAilaUrl("lesson")}/${id}`);
            }
            return response;
          },
        }),
        onError: (error) => callbacks.current.onError(error),
        onFinish: (options) => callbacks.current.onFinish(options),
      }),
  );

  const {
    messages: uiMessages,
    sendMessage,
    regenerate,
    stop: stopStreaming,
    status,
    setMessages: setSdkMessages,
  } = useChat({ chat });

  const hasInitializedMessages = useRef(initialMessages !== null);
  const initializeMessages: AiSdkActions["initializeMessages"] = (history) => {
    if (hasInitializedMessages.current) {
      return;
    }
    setSdkMessages(history.flatMap(toUIMessage));
    hasInitializedMessages.current = true;
  };

  /**
   * This is a hack to ensure that the assistant messages have a stable id
   * across server and client.
   * We should move away from this either when the AI SDK supports it
   * natively, or when we move away from streaming.
   */
  const pendingIds = useRef(new Map<string, string>());
  const messages = useMemo(
    () =>
      uiMessages.map((uiMessage) => {
        const message = toAiMessage(uiMessage);
        if (message.role !== "assistant" || message.id.startsWith("a-")) {
          return message;
        }

        const idFromContent = findMessageIdFromContent(message);
        if (idFromContent) {
          return { ...message, id: idFromContent };
        }

        let pendingId = pendingIds.current.get(uiMessage.id);
        if (!pendingId) {
          pendingId = "TEMP_PENDING_" + nanoid();
          pendingIds.current.set(uiMessage.id, pendingId);
        }
        return { ...message, id: pendingId };
      }),
    [uiMessages],
  );

  const isLoading = status === "submitted" || status === "streaming";
  const stop: AiSdkActions["stop"] = () => void stopStreaming();
  const append: AiSdkActions["append"] = ({ content }) =>
    sendMessage({ text: content });
  const reload: AiSdkActions["reload"] = () => regenerate();

  // Hooks to update the Zustand stores
  useChatStoreAiSdkSync(
    messages,
    isLoading,
    stop,
    append,
    reload,
    initializeMessages,
  );
  useLessonPlanStoreAiSdkSync(messages, isLoading);

  return null;
}
